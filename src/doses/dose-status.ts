import type { DoseStatus } from './dto/dose-status';
import type { TodayDose } from './dto/today-dose-output';

export function doseStatus(
  { state, plannedAt }: TodayDose,
  now: Date,
): DoseStatus {
  if (state === 'taken') return 'taken';
  if (state === 'skipped') return 'skipped';
  return plannedAt <= now ? 'overdue' : 'planned';
}
