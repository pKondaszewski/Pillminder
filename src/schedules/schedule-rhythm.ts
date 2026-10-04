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
): string {
  const { intervalDays, timesOfDay, quantity } = schedule;
  const base =
    intervalDays === 1
      ? t('schedule.daily')
      : t('schedule.everyXDays', { days: intervalDays });
  const quantityText =
    quantity !== 1
      ? ` · ${t('schedule.quantityValue', { count: quantity })}`
      : '';
  return `${base} · ${timesOfDay.join(', ')}${quantityText}${describePeriod(schedule, t, formatDate)}`;
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
