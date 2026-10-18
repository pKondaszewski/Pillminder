import { planDoseTransition } from './dose-transition';
import type { TodayDose } from './dto/today-dose-output';

export type CorrectionTarget = 'taken' | 'skipped';

export function correctionStockDelta(
  dose: TodayDose,
  target: CorrectionTarget,
): number {
  const transition = planDoseTransition(
    dose,
    target,
    dose.quantity,
    dose.plannedAt,
  );
  return transition?.stockDelta ?? 0;
}
