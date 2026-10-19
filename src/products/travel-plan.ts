import { addDays, startOfDay } from '@/config/date-utils';
import type { Translate } from '@/config/translate';
import type { Schedule } from '@/schedules/schedule-service';

import type {
  TravelPlanEntry,
  TravelStockVerdict,
} from './dto/travel-plan-output';
import { productLabel } from './product-label';
import type { Product } from './product-service';
import { formatAmount } from './product-unit';
import { consumptionBetween, reorderStatus } from './reorder';

export interface TravelPlanContext {
  t: Translate;
  locale: string;
  now: Date;
}

export function buildTravelPlan(
  products: Product[],
  schedules: Schedule[],
  departure: Date,
  returnDay: Date,
  { t, locale, now }: TravelPlanContext,
): TravelPlanEntry[] {
  return products
    .filter((product) => product.status !== 'archived')
    .flatMap((product) => {
      const rhythm = schedules.filter(
        (schedule) => schedule.productId === product.id,
      );
      const needed = consumptionBetween(rhythm, departure, returnDay);
      if (needed <= 0) return [];
      return [
        {
          id: product.id,
          title: productLabel(product.name, product.strength),
          pack: describePack(needed, product, t),
          verdict: stockVerdict(product.stock, rhythm, returnDay, now),
        },
      ];
    })
    .sort(
      (a, b) =>
        a.title.localeCompare(b.title, locale) || a.id.localeCompare(b.id),
    );
}

function describePack(needed: number, product: Product, t: Translate): string {
  const count = Math.ceil(needed);
  return product.unit
    ? formatAmount(count, product.unit, t)
    : t('travel.pieces', { count });
}

function stockVerdict(
  stock: number | null,
  schedules: Schedule[],
  returnDay: Date,
  now: Date,
): TravelStockVerdict | null {
  if (stock == null) return null;
  const { runOutAt, reorderAt } = reorderStatus(stock, schedules, now);
  const tripEnd = addDays(startOfDay(returnDay), 1);
  if (runOutAt === null || reorderAt === null) return 'enough';
  if (runOutAt < tripEnd) return 'runsOutDuringTrip';
  if (reorderAt < tripEnd) return 'runsOutAfterReturn';
  return 'enough';
}
