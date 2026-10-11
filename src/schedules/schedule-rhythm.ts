import { formatAmount, type ProductUnit } from '@/products/product-unit';

import { isPaused } from './schedule-pause';
import type { Schedule } from './schedule-repository';

export type Translate = (
  key: string,
  options?: Record<string, string | number>,
) => string;

export function describeRhythm(
  schedule: Schedule,
  t: Translate,
  formatDate: (date: Date) => string,
  unit: ProductUnit | null,
  now: Date,
): string {
  const { intervalDays, timesOfDay, quantity } = schedule;
  const base =
    intervalDays === 1
      ? t('schedule.daily')
      : t('schedule.everyXDays', { days: intervalDays });
  const quantityText = describeQuantity(quantity, unit, t);
  const rhythm = `${base} · ${timesOfDay.join(', ')}${quantityText}${describePeriod(schedule, t, formatDate)}`;
  return isPaused(schedule, now)
    ? `${describePause(schedule, t, formatDate)} · ${rhythm}`
    : rhythm;
}

export function describePause(
  { resumeAt }: Schedule,
  t: Translate,
  formatDate: (date: Date) => string,
): string {
  return resumeAt
    ? t('schedule.pausedUntil', { date: formatDate(resumeAt) })
    : t('schedule.paused');
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
  { startDate, endDate }: Schedule,
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
