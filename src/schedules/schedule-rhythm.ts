import { formatAmount, type ProductUnit } from '@/products/product-unit';

import type { CourseProgress } from './schedule-list';
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
  const quantityText = describeQuantity(quantity, unit, t);
  const period = describePeriod(schedule, t, formatDate);
  const rhythm = `${describeInterval(intervalDays, t)} · ${timesOfDay.join(', ')}${quantityText}${period && ` · ${period}`}`;
  return isPaused(schedule, now)
    ? `${describePause(schedule, t, formatDate)} · ${rhythm}`
    : rhythm;
}

export function describeInterval(intervalDays: number, t: Translate): string {
  return intervalDays === 1
    ? t('schedule.daily')
    : t('schedule.everyXDays', { days: intervalDays });
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

export function describeCourse(
  progress: CourseProgress | null,
  endDate: Date,
  t: Translate,
  formatDate: (date: Date) => string,
): string {
  const until = t('schedule.periodUntil', { date: formatDate(endDate) });
  return progress
    ? `${t('schedule.courseDay', { day: progress.day, total: progress.total })} · ${until}`
    : until;
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

export function describePeriod(
  { startDate, endDate }: Schedule,
  t: Translate,
  formatDate: (date: Date) => string,
): string {
  if (startDate && endDate) {
    return t('schedule.periodRange', {
      from: formatDate(startDate),
      to: formatDate(endDate),
    });
  }
  if (startDate)
    return t('schedule.periodFrom', { date: formatDate(startDate) });
  if (endDate) return t('schedule.periodUntil', { date: formatDate(endDate) });
  return '';
}
