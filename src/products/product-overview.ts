import { categoryLabel, isBuiltInCategory } from '@/products/category';
import { productLabel } from '@/products/product-label';
import type { Product } from '@/products/product-service';
import { formatAmount, type ProductUnit } from '@/products/product-unit';
import { reorderStatus } from '@/products/reorder';
import { describeRhythm, type Translate } from '@/schedules/schedule-rhythm';
import type { Schedule } from '@/schedules/schedule-service';

import type {
  ProductOverview,
  ProductOverviewEntry,
  ProductOverviewStock,
} from './dto/product-overview-output';

const BUILT_IN_ORDER = ['medication', 'supplement', 'care'];

export interface ProductOverviewContext {
  t: Translate;
  formatDate: (date: Date) => string;
  locale: string;
  now: Date;
}

export function buildProductOverview(
  products: Product[],
  schedules: Schedule[],
  context: ProductOverviewContext,
): ProductOverview {
  const active = products.filter((product) => product.status !== 'archived');
  return {
    products: [...active]
      .sort(byCategoryThenName(context.locale))
      .map((product) =>
        toEntry(
          product,
          schedules.filter((schedule) => schedule.productId === product.id),
          context,
        ),
      ),
  };
}

function toEntry(
  product: Product,
  schedules: Schedule[],
  { t, formatDate, now }: ProductOverviewContext,
): ProductOverviewEntry {
  return {
    id: product.id,
    title: productLabel(product.name, product.strength),
    category: categoryLabel(product.category, t),
    rhythm:
      schedules.length === 0
        ? [t('overview.noRhythm')]
        : [...schedules]
            .sort(byFirstTime)
            .map((schedule) =>
              describeRhythm(schedule, t, formatDate, product.unit, now),
            ),
    stock: describeStock(product, schedules, t, now),
  };
}

function describeStock(
  product: Product,
  schedules: Schedule[],
  t: Translate,
  now: Date,
): ProductOverviewStock {
  if (product.stock == null) {
    return { text: t('overview.stockUnknown'), isLow: false };
  }
  const { daysLeft, isLow: belowThreshold } = reorderStatus(
    product.stock,
    schedules,
    undefined,
    now,
  );
  const isLow = belowThreshold && daysLeft !== null;
  const parts = [
    describeStockAmount(product.stock, product.unit, t),
    ...(daysLeft === null
      ? []
      : [t('overview.stockDaysLeft', { days: Math.ceil(daysLeft) })]),
    ...(isLow ? [t('products.lowStock')] : []),
  ];
  return { text: parts.join(' · '), isLow };
}

function describeStockAmount(
  stock: number,
  unit: ProductUnit | null,
  t: Translate,
): string {
  return unit
    ? t('overview.stockAmount', { amount: formatAmount(stock, unit, t) })
    : t('overview.stockUnits', { count: stock });
}

function byFirstTime(a: Schedule, b: Schedule): number {
  const firstA = [...a.timesOfDay].sort()[0] ?? '';
  const firstB = [...b.timesOfDay].sort()[0] ?? '';
  return firstA.localeCompare(firstB) || a.intervalDays - b.intervalDays;
}

// Built-in categories first in a fixed medical order, then custom ones
// alphabetically; within a category by product label. The product id breaks
// ties so the order never depends on the input order.
function byCategoryThenName(locale: string) {
  const rank = (category: string) =>
    isBuiltInCategory(category)
      ? BUILT_IN_ORDER.indexOf(category)
      : BUILT_IN_ORDER.length;

  return (a: Product, b: Product): number =>
    rank(a.category) - rank(b.category) ||
    a.category.localeCompare(b.category, locale) ||
    productLabel(a.name, a.strength).localeCompare(
      productLabel(b.name, b.strength),
      locale,
    ) ||
    a.id.localeCompare(b.id);
}
