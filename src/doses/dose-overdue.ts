import type { TodayDose } from './dto/today-dose-output';

export const BULK_TAKE_MIN_OVERDUE = 2;

export function overdueDoses(doses: TodayDose[], now: Date): TodayDose[] {
  return doses.filter(
    (dose) => dose.state === 'pending' && dose.plannedAt <= now,
  );
}
