import { formatAmount, type ProductUnit } from '@/products/product-unit';

export type Translate = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export interface RhythmText {
  intervalDays: number;
  timesOfDay: string[];
  quantity: number;
  startDate: Date | null;
  endDate: Date | null;
}

export function describeRhythm(
  schedule: RhythmText,
  t: Translate,
  formatDate: (date: Date) => string,
  unit: ProductUnit | null = null,
): string {
  const { intervalDays, timesOfDay, quantity } = schedule;
  const base =
    intervalDays === 1
      ? t('schedule.daily')
      : t('schedule.everyXDays', { days: intervalDays });
  const quantityText = describeQuantity(quantity, unit, t);
  return `${base} · ${timesOfDay.join(', ')}${quantityText}${describePeriod(schedule, t, formatDate)}`;
}

function describeQuantity(
  quantity: number,
  unit: ProductUnit | null,
  t: Translate,
): string {
  if (unit) {
    return ` · ${t('schedule.amountValue', { amount: formatAmount(quantity, unit, t) })}`;
  }
  return quantity !== 1
    ? ` · ${t('schedule.quantityValue', { count: quantity })}`
    : '';
}

function describePeriod(
  { startDate, endDate }: RhythmText,
  t: Translate,
  formatDate: (date: Date) => string,
): string {
  if (startDate && endDate) {
    return ` · ${t('schedule.periodRange', {
      from: formatDate(startDate),
      to: formatDate(endDate),
    })}`;
  }
  if (startDate) {
    return ` · ${t('schedule.periodFrom', { date: formatDate(startDate) })}`;
  }
  if (endDate) {
    return ` · ${t('schedule.periodUntil', { date: formatDate(endDate) })}`;
  }
  return '';
}
