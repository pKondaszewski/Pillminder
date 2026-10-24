import { DAYS_IN_WEEK } from '@/config/calendar-grid';
import { daysBetween } from '@/config/date-utils';

import { cycleOnShare, isCycleOnDay } from './cycle-days';
import type { Rhythm } from './dto/rhythm';
import { isTaperOver } from './step-days';

export function isRhythmDay(rhythm: Rhythm, anchor: Date, day: Date): boolean {
  const { intervalDays, weekdays } = rhythm;
  if (!isCycleOnDay(rhythm, day) || isTaperOver(rhythm, day)) return false;
  if (weekdays) return weekdays.includes(day.getDay());
  return daysBetween(anchor, day) % intervalDays === 0;
}

// Share of days that carry a dose, averaged over the rhythm's cycle.
export function averageDayShare(rhythm: Rhythm): number {
  const { intervalDays, weekdays, cycle } = rhythm;
  const share = weekdays ? weekdays.length / DAYS_IN_WEEK : 1 / intervalDays;
  return cycle ? share * cycleOnShare(cycle) : share;
}

// Weekdays and cycles are absolute, so a given day either has the doses or
// nothing. An interval has no fixed calendar days without its anchor, so it
// stays averaged.
export function dayShareOn(rhythm: Rhythm, day: Date): number {
  const { intervalDays, weekdays } = rhythm;
  if (!isCycleOnDay(rhythm, day) || isTaperOver(rhythm, day)) return 0;
  if (weekdays) return weekdays.includes(day.getDay()) ? 1 : 0;
  return 1 / intervalDays;
}
