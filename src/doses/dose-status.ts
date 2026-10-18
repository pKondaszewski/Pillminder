import type { TodayDose } from './dto/today-dose-output';

export type DoseStatus = 'taken' | 'overdue' | 'skipped' | 'planned';

export function doseStatus(
  { state, plannedAt }: TodayDose,
  now: Date,
): DoseStatus {
  if (state === 'taken') return 'taken';
  if (state === 'skipped') return 'skipped';
  return plannedAt <= now ? 'overdue' : 'planned';
}
