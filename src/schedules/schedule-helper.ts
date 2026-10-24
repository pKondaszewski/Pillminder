import { addDays, startOfDay } from '@/config/date-utils';

import type { Rhythm } from './dto/rhythm';
import { isRhythmDay } from './rhythm-days';
import { isPaused, type SchedulePeriod } from './schedule-pause';
import { isTaperOver } from './step-days';

const PREVIEW_COUNT = 3;
const MAX_SCAN_DAYS = 3660;

export function nextOccurrences(
  rhythm: Rhythm,
  timesOfDay: string[],
  count: number,
  period: SchedulePeriod,
  now: Date,
): Date[] {
  if (timesOfDay.length === 0 || count <= 0) return [];

  const result: Date[] = [];
  for (const occurrence of occurrenceStream(rhythm, timesOfDay, period, now)) {
    result.push(occurrence);
    if (result.length >= count) break;
  }
  return result;
}

export function previewOccurrences(
  rhythm: Rhythm,
  timesOfDay: string[],
  period: SchedulePeriod,
  now: Date,
): Date[] {
  return nextOccurrences(rhythm, timesOfDay, PREVIEW_COUNT, period, now);
}

export function occurrencesWithin(
  rhythm: Rhythm,
  timesOfDay: string[],
  horizonDays: number,
  period: SchedulePeriod,
  now: Date,
): Date[] {
  if (timesOfDay.length === 0 || horizonDays <= 0) return [];

  const first = earliestDay(period, now);
  if (!first) return [];

  const until = addDays(first, horizonDays);
  const result: Date[] = [];
  for (const occurrence of occurrenceStream(rhythm, timesOfDay, period, now)) {
    if (occurrence >= until) break;
    result.push(occurrence);
  }
  return result;
}

// Without a start date the rhythm is anchored to today (rolling window), or to
// the resume day of a pause; with one, every N-th day counts from the start so
// the rhythm stays stable across a pause. Weekdays ignore the anchor.
function* occurrenceStream(
  rhythm: Rhythm,
  timesOfDay: string[],
  period: SchedulePeriod,
  now: Date,
): Generator<Date> {
  const earliest = earliestDay(period, now);
  if (!earliest) return;

  const { startDate, endDate } = period;
  const times = [...timesOfDay].sort();
  const lastDay = endDate ? startOfDay(endDate) : null;
  const anchor = startDate ? startOfDay(startDate) : earliest;

  let day = anchor >= earliest ? anchor : earliest;
  for (let scanned = 0; scanned < MAX_SCAN_DAYS; scanned++) {
    if ((lastDay && day > lastDay) || isTaperOver(rhythm, day)) return;
    if (isRhythmDay(rhythm, anchor, day)) {
      let previous: Date | null = null;
      for (const time of times) {
        const occurrence = atTime(day, time);
        // Times inside a spring-forward gap both land on the first valid instant.
        const isCollapsed = previous?.getTime() === occurrence.getTime();
        previous = occurrence;
        if (occurrence >= now && !isCollapsed) yield occurrence;
      }
    }
    day = addDays(day, 1);
  }
}

// Null: paused without a resume date, so no day is active.
function earliestDay(period: SchedulePeriod, now: Date): Date | null {
  if (!isPaused(period, now)) return startOfDay(now);
  return period.resumeAt ? startOfDay(period.resumeAt) : null;
}

function atTime(day: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const occurrence = new Date(day);
  occurrence.setHours(hours, minutes, 0, 0);
  return occurrence;
}
