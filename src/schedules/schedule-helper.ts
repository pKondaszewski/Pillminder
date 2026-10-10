import { addDays, startOfDay } from '@/config/date-utils';

import { isPaused } from './schedule-pause';

export interface SchedulePeriod {
  startDate?: Date | null;
  endDate?: Date | null;
  pausedAt?: Date | null;
  resumeAt?: Date | null;
}

const PREVIEW_COUNT = 3;
const MAX_SCAN_DAYS = 3660;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

export function nextOccurrences(
  intervalDays: number,
  timesOfDay: string[],
  count: number,
  period: SchedulePeriod = {},
  now: Date = new Date(),
): Date[] {
  if (timesOfDay.length === 0 || count <= 0) return [];

  const result: Date[] = [];
  for (const occurrence of occurrenceStream(
    intervalDays,
    timesOfDay,
    period,
    now,
  )) {
    result.push(occurrence);
    if (result.length >= count) break;
  }
  return result;
}

export function previewOccurrences(
  intervalDays: number,
  timesOfDay: string[],
  period: SchedulePeriod = {},
): Date[] {
  return nextOccurrences(intervalDays, timesOfDay, PREVIEW_COUNT, period);
}

export function occurrencesWithin(
  intervalDays: number,
  timesOfDay: string[],
  horizonDays: number,
  period: SchedulePeriod = {},
  now: Date = new Date(),
): Date[] {
  if (timesOfDay.length === 0 || horizonDays <= 0) return [];

  const first = earliestDay(period, now);
  if (!first) return [];

  const until = addDays(first, horizonDays);
  const result: Date[] = [];
  for (const occurrence of occurrenceStream(
    intervalDays,
    timesOfDay,
    period,
    now,
  )) {
    if (occurrence >= until) break;
    result.push(occurrence);
  }
  return result;
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((to.getTime() - from.getTime()) / MS_PER_DAY);
}

// Without a start date the rhythm is anchored to today (rolling window), or to
// the resume day of a pause; with one, every N-th day counts from the start so
// the rhythm stays stable across a pause.
function* occurrenceStream(
  intervalDays: number,
  timesOfDay: string[],
  period: SchedulePeriod,
  now: Date,
): Generator<Date> {
  const earliest = earliestDay(period, now);
  if (!earliest) return;

  const { startDate, endDate } = period;
  const step = Math.max(1, intervalDays);
  const times = [...timesOfDay].sort();
  const lastDay = endDate ? startOfDay(endDate) : null;

  let day = firstDay(
    startDate ? startOfDay(startDate) : earliest,
    earliest,
    step,
  );
  for (let scanned = 0; scanned < MAX_SCAN_DAYS; scanned += step) {
    if (lastDay && day > lastDay) return;
    for (const time of times) {
      const occurrence = atTime(day, time);
      if (occurrence >= now) yield occurrence;
    }
    day = addDays(day, step);
  }
}

// Null: paused without a resume date, so no day is active.
function earliestDay(
  { pausedAt, resumeAt }: SchedulePeriod,
  now: Date,
): Date | null {
  if (!isPaused({ pausedAt, resumeAt }, now)) return startOfDay(now);
  return resumeAt ? startOfDay(resumeAt) : null;
}

function firstDay(anchor: Date, earliest: Date, step: number): Date {
  if (anchor >= earliest) return anchor;
  const elapsed = daysBetween(anchor, earliest);
  return addDays(anchor, Math.ceil(elapsed / step) * step);
}

function atTime(day: Date, time: string): Date {
  const [hours, minutes] = time.split(':').map(Number);
  const occurrence = new Date(day);
  occurrence.setHours(hours, minutes, 0, 0);
  return occurrence;
}
