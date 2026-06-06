import type { Dose, DoseState, Schedule } from './types';

function parseISODate(date: string): Date {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

function parseTimeOfDay(time: string): [number, number] {
  const [h, min] = time.split(':').map(Number);
  return [h, min];
}

function dayDiff(a: Date, b: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  const da = new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime();
  const db = new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round((db - da) / msPerDay);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function generatePlannedDoses(
  schedule: Schedule,
  rangeStart: Date,
  rangeEnd: Date,
): Date[] {
  const interval = Math.max(1, Math.floor(schedule.intervalDays));
  const start = parseISODate(schedule.startDate);
  const end = schedule.endDate ? parseISODate(schedule.endDate) : null;

  const offset = dayDiff(start, rangeStart);
  const skip = offset > 0 ? Math.ceil(offset / interval) * interval : 0;
  let day = addDays(start, skip);

  const result: Date[] = [];
  while (dayDiff(day, rangeEnd) >= 0) {
    if (end && dayDiff(day, end) < 0) break;
    for (const time of schedule.timesOfDay) {
      const [h, min] = parseTimeOfDay(time);
      const planned = new Date(day);
      planned.setHours(h, min, 0, 0);
      if (planned >= rangeStart && planned <= rangeEnd) {
        result.push(planned);
      }
    }
    day = addDays(day, interval);
  }
  return result;
}

export function isOverdue(dose: Dose, now: Date): boolean {
  return dose.state === 'pending' && dose.plannedAt < now;
}

export function effectiveState(dose: Dose, now: Date): DoseState {
  return isOverdue(dose, now) ? 'skipped' : dose.state;
}
