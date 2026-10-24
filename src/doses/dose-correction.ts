import { planDoseTransition } from './dose-transition';
import type { CorrectionTarget } from './dto/correction-target';
import type { TodayDose } from './dto/today-dose-output';

export function correctionStockDelta(
  dose: TodayDose,
  target: CorrectionTarget,
): number {
  const transition = planDoseTransition(
    dose,
    target,
    dose.quantity,
    dose.plannedAt,
    // The preview does not know the stock, so a take from a too-low stock may show more than is deducted.
    null,
  );
  return transition?.stockDelta ?? 0;
}
