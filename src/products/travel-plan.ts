import { addDays, MS_PER_DAY, startOfDay } from '@/config/date-utils';
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
          name: product.name,
          title: productLabel(product.name, product.strength),
          pack: describePack(needed, product, t),
          ...stockOutlook(product.stock, rhythm, departure, returnDay, now),
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

function stockOutlook(
  stock: number | null,
  schedules: Schedule[],
  departure: Date,
  returnDay: Date,
  now: Date,
): { verdict: TravelStockVerdict | null; runOutOffsetDays: number | null } {
  if (stock == null) return { verdict: null, runOutOffsetDays: null };
  const { runOutAt, reorderAt } = reorderStatus(stock, schedules, now);
  if (runOutAt === null || reorderAt === null) {
    return { verdict: 'enough', runOutOffsetDays: null };
  }
  const tripEnd = addDays(startOfDay(returnDay), 1);
  return {
    verdict: verdictFor(runOutAt, reorderAt, tripEnd),
    runOutOffsetDays:
      (runOutAt.getTime() - startOfDay(departure).getTime()) / MS_PER_DAY,
  };
}

function verdictFor(
  runOutAt: Date,
  reorderAt: Date,
  tripEnd: Date,
): TravelStockVerdict {
  if (runOutAt < tripEnd) return 'runsOutDuringTrip';
  if (reorderAt < tripEnd) return 'runsOutAfterReturn';
  return 'enough';
}
