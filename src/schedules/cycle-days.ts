import { DAYS_IN_WEEK } from '@/config/calendar-grid';
import { daysBetween, startOfDay } from '@/config/date-utils';

import type { Rhythm } from './dto/rhythm';
import type { CycleUnit, ScheduleCycle } from './dto/schedule-cycle';

export function isCycleOnDay(rhythm: Rhythm, day: Date): boolean {
  const { cycle, cycleAnchor } = rhythm;
  if (!cycle || !cycleAnchor) return true;

  const target = startOfDay(day);
  const position =
    daysBetween(startOfDay(cycleAnchor), target) -
    pausedDaysBefore(rhythm, target);
  return position >= 0 && position % cycleLength(cycle) < cycle.onDays;
}

export function daysPerUnit(unit: CycleUnit): number {
  return unit === 'weeks' ? DAYS_IN_WEEK : 1;
}

export function cycleUnitKey(unit: CycleUnit): string {
  return unit === 'weeks' ? 'schedule.cycleWeeks' : 'schedule.cycleDays';
}

export function cycleOnShare(cycle: ScheduleCycle): number {
  return cycle.onDays / cycleLength(cycle);
}

// Days spent paused do not count toward on/off, so a pause freezes the cycle.
// The counter holds the closed pauses; the current (or last, if it ended by
// itself) pause is still in pausedAt/resumeAt and is counted up to `day`.
export function pausedDaysBefore(rhythm: Rhythm, day: Date): number {
  const {
    cycle,
    cycleAnchor,
    cyclePausedDays = 0,
    pausedAt,
    resumeAt,
  } = rhythm;
  if (!cycle || !cycleAnchor) return 0;
  if (!pausedAt) return cyclePausedDays;

  const from = laterOf(startOfDay(pausedAt), startOfDay(cycleAnchor));
  const until = resumeAt ? earlierOf(startOfDay(resumeAt), day) : day;
  return cyclePausedDays + Math.max(0, daysBetween(from, until));
}

function cycleLength({ onDays, offDays }: ScheduleCycle): number {
  return onDays + offDays;
}

function laterOf(a: Date, b: Date): Date {
  return a > b ? a : b;
}

function earlierOf(a: Date, b: Date): Date {
  return a < b ? a : b;
}
