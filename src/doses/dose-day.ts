import { addDays, startOfDay } from '@/config/date-utils';

import { type AdherenceDose, calculateAdherence } from './dose-adherence';
import type { DayStatus } from './dto/day-status';

export const DOSE_HORIZON_DAYS = 30;

export function dayStatus(
  day: Date,
  doses: AdherenceDose[],
  now: Date,
): DayStatus {
  const from = startOfDay(day);
  const counts = calculateAdherence(doses, from, addDays(from, 1), now);

  if (counts.missed > 0) return 'missed';
  if (counts.skipped > 0) return 'skipped';
  if (counts.upcoming > 0) return 'upcoming';
  return counts.taken > 0 ? 'allTaken' : 'none';
}

// Doses are generated from now, so only the days that end before now + horizon are complete.
export function lastPlannedDay(now: Date): Date {
  return addDays(startOfDay(now), DOSE_HORIZON_DAYS - 1);
}
