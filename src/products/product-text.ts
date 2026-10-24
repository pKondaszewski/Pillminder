import { daysBetween, startOfDay } from '@/config/date-utils';
import type { Translate } from '@/config/translate';
import { describeDays } from '@/schedules/schedule-rhythm';
import type { Schedule } from '@/schedules/schedule-service';

import type { ReorderStatus } from './dto/reorder-status';
import type { StockSummary } from './dto/stock-summary';
import type { Product } from './product-service';

export function wholeDaysLeft(daysLeft: number): number {
  return Math.ceil(daysLeft);
}

export function stockAmountText(
  stock: number,
  unit: Product['unit'],
  t: Translate,
): string {
  return unit
    ? t(`products.unitShort.${unit}`, { count: stock })
    : t('products.pieces', { count: stock });
}

export function stockSummary(
  product: Pick<Product, 'stock' | 'unit' | 'status'>,
  reorder: ReorderStatus | undefined,
  t: Translate,
): StockSummary {
  if (product.stock === null) {
    return { kind: 'caption', label: t('products.stockUntracked') };
  }
  const amount = stockAmountText(product.stock, product.unit, t);
  if (product.status === 'archived') return { kind: 'caption', label: amount };
  if (!reorder || reorder.daysLeft === null) {
    return {
      kind: 'caption',
      label: `${amount} · ${t('products.noSchedule')}`,
    };
  }
  const daysLeft = wholeDaysLeft(reorder.daysLeft);
  return {
    kind: 'bar',
    daysLeft: reorder.daysLeft,
    label: `${amount} · ${t('products.daysCount', { count: daysLeft })}`,
  };
}

export function supplyHint(
  reorder: ReorderStatus,
  now: Date,
  t: Translate,
  formatDate: (date: Date) => string,
): string | null {
  if (reorder.runOutAt === null || reorder.reorderAt === null) return null;
  const lasts = t('products.supplyLastsUntil', {
    date: formatDate(reorder.runOutAt),
  });
  const order =
    reorder.reorderAt > now
      ? t('products.supplyOrderBy', { date: formatDate(reorder.reorderAt) })
      : t('products.supplyOrderNow');
  return `${lasts} · ${order}`;
}

export function rhythmSummary(
  schedules: Schedule[],
  t: Translate,
  formatTimes: (times: string[]) => string,
  firstWeekday: number,
): string {
  if (schedules.length === 0) return t('products.noSchedule');
  if (schedules.length > 1) {
    return t('products.schedulesCount', { count: schedules.length });
  }
  const [schedule] = schedules;
  return `${describeDays(schedule, t, firstWeekday)} · ${formatTimes(schedule.timesOfDay)}`;
}

export function lastUsedText(
  lastUsedAt: Date | null,
  now: Date,
  t: Translate,
  formatDate: (date: Date) => string,
  formatTime: (date: Date) => string,
): string {
  if (lastUsedAt === null) return t('products.neverUsed');
  const time = formatTime(lastUsedAt);
  const daysAgo = daysBetween(startOfDay(lastUsedAt), startOfDay(now));
  if (daysAgo === 0) return t('products.lastUsedToday', { time });
  if (daysAgo === 1) return t('products.lastUsedYesterday', { time });
  return t('products.lastUsedOn', { date: formatDate(lastUsedAt), time });
}
