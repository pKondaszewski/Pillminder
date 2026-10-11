import { addDays } from './date-utils';
import type { SupportedLanguage } from './i18n';

export const DAYS_IN_WEEK = 7;

const WEEKDAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'] as const;

// JS convention: 0 = Sunday ... 6 = Saturday.
const FIRST_WEEKDAY: Record<SupportedLanguage, number> = {
  en: 0,
  pl: 1,
};

export function firstWeekdayOf(language: SupportedLanguage): number {
  return FIRST_WEEKDAY[language];
}

export function weekdayKeysFrom(firstWeekday: number): string[] {
  return [
    ...WEEKDAY_KEYS.slice(firstWeekday),
    ...WEEKDAY_KEYS.slice(0, firstWeekday),
  ];
}

export function monthGridDays(month: Date, firstWeekday: number): Date[] {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const last = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const leading = (first.getDay() - firstWeekday + DAYS_IN_WEEK) % DAYS_IN_WEEK;
  const trailing =
    (firstWeekday + DAYS_IN_WEEK - 1 - last.getDay()) % DAYS_IN_WEEK;
  const length = leading + last.getDate() + trailing;

  const gridStart = addDays(first, -leading);
  return Array.from({ length }, (_, index) => addDays(gridStart, index));
}

export function splitIntoWeeks(days: Date[]): Date[][] {
  return Array.from({ length: days.length / DAYS_IN_WEEK }, (_, week) =>
    days.slice(week * DAYS_IN_WEEK, (week + 1) * DAYS_IN_WEEK),
  );
}
