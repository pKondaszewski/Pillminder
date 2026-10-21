import { addDays, isoDay, startOfDay } from '@/config/date-utils';

import type { Intake } from './dto/intake-output';

export const RECENT_INTAKE_DAYS = 14;

export function intakeDayKeys(intakes: Intake[]): Set<string> {
  return new Set(intakes.map(({ takenAt }) => isoDay(takenAt)));
}

export function recentIntakeCount(intakes: Intake[], now: Date): number {
  const from = addDays(startOfDay(now), 1 - RECENT_INTAKE_DAYS);
  return intakes.filter(({ takenAt }) => takenAt >= from && takenAt <= now)
    .length;
}
