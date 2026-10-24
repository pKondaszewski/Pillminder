import { DAYS_IN_WEEK } from '@/config/calendar-grid';
import { daysBetween } from '@/config/date-utils';

import type { Rhythm } from './dto/rhythm';

export function isRhythmDay(rhythm: Rhythm, anchor: Date, day: Date): boolean {
  const { intervalDays, weekdays } = rhythm;
  if (weekdays) return weekdays.includes(day.getDay());
  return daysBetween(anchor, day) % intervalDays === 0;
}

// Share of days that carry a dose, averaged over the rhythm's cycle.
export function averageDayShare({ intervalDays, weekdays }: Rhythm): number {
  return weekdays ? weekdays.length / DAYS_IN_WEEK : 1 / intervalDays;
}

// Weekdays are absolute, so a given day either has the doses or nothing. An
// interval has no fixed calendar days without its anchor, so it stays averaged.
export function dayShareOn(rhythm: Rhythm, day: Date): number {
  const { weekdays } = rhythm;
  if (!weekdays) return averageDayShare(rhythm);
  return weekdays.includes(day.getDay()) ? 1 : 0;
}
