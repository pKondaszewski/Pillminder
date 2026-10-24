import { DAYS_IN_WEEK, weekdayKeyOf } from '@/config/calendar-grid';
import type { Translate } from '@/config/translate';
import type { ProductUnit } from '@/products/product-service';
import { formatAmount } from '@/products/product-unit';

import { cycleUnitKey, daysPerUnit } from './cycle-days';
import type { CourseProgress } from './dto/course-progress';
import type { Rhythm } from './dto/rhythm';
import type { ScheduleCycle } from './dto/schedule-cycle';
import { isPaused } from './schedule-pause';
import type { Schedule } from './schedule-repository';

export function describeRhythm(
  schedule: Schedule,
  t: Translate,
  formatDate: (date: Date) => string,
  unit: ProductUnit | null,
  now: Date,
  formatTimes: (times: string[]) => string,
  firstWeekday: number,
): string {
  const { timesOfDay, quantity } = schedule;
  const quantityText = describeQuantity(quantity, unit, t);
  const period = describePeriod(schedule, t, formatDate);
  const rhythm = `${describeDays(schedule, t, firstWeekday)} · ${formatTimes(timesOfDay)}${quantityText}${period && ` · ${period}`}`;
  return isPaused(schedule, now)
    ? `${describePause(schedule, t, formatDate)} · ${rhythm}`
    : rhythm;
}

export function describeDays(
  rhythm: Rhythm,
  t: Translate,
  firstWeekday: number,
): string {
  const { cycle } = rhythm;
  const days = describeBaseDays(rhythm, t, firstWeekday);
  if (!cycle) return days;
  const cycleText = describeCycle(cycle, t);
  return isEveryDay(rhythm) ? cycleText : `${days} · ${cycleText}`;
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

function inWeekOrder(weekdays: number[], firstWeekday: number): number[] {
  const offset = (day: number) =>
    (day - firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  return [...weekdays].sort((a, b) => offset(a) - offset(b));
}

function describeBaseDays(
  { intervalDays, weekdays }: Rhythm,
  t: Translate,
  firstWeekday: number,
): string {
  if (weekdays && weekdays.length < DAYS_IN_WEEK) {
    const names = inWeekOrder(weekdays, firstWeekday).map((day) =>
      t(`calendar.weekday.${weekdayKeyOf(day)}`),
    );
    return weekdays.length === 1
      ? t('schedule.weeklyOn', { day: names[0] })
      : names.join(', ');
  }
  return !weekdays && intervalDays > 1
    ? t('schedule.everyXDays', { days: intervalDays })
    : t('schedule.daily');
}

function describeCycle(
  { onDays, offDays, unit }: ScheduleCycle,
  t: Translate,
): string {
  const perUnit = daysPerUnit(unit);
  const key = cycleUnitKey(unit);
  return t('schedule.cycleOnOff', {
    on: t(key, { count: onDays / perUnit }),
    off: t(key, { count: offDays / perUnit }),
    offCount: offDays / perUnit,
  });
}

function isEveryDay({ intervalDays, weekdays }: Rhythm): boolean {
  return weekdays ? weekdays.length === DAYS_IN_WEEK : intervalDays === 1;
}
