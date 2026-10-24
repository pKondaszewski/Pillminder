import { deductedQuantity } from '@/intakes/intake-stock';

export const DOSE_STATES = ['pending', 'taken', 'skipped'] as const;

export type DoseState = (typeof DOSE_STATES)[number];

export interface TransitionInput {
  state: DoseState;
  takenQuantity: number | null;
}

export interface DoseTransition {
  state: DoseState;
  takenAt: Date | null;
  takenQuantity: number | null;
  stockDelta: number;
}

export function planDoseTransition(
  dose: TransitionInput,
  target: DoseState,
  scheduleQuantity: number,
  takenAt: Date,
  stock: number | null,
): DoseTransition | null {
  if (dose.state === target) return null;

  if (target === 'taken') {
    // The stock cannot go below zero, so only what was available is recorded.
    const deducted =
      deductedQuantity(stock, scheduleQuantity) ?? scheduleQuantity;
    return {
      state: target,
      takenAt,
      takenQuantity: deducted,
      stockDelta: -deducted,
    };
  }

  // Leaving "taken" restores what was actually deducted; doses taken before
  // quantities existed have no snapshot and consumed exactly one unit.
  const stockDelta = dose.state === 'taken' ? (dose.takenQuantity ?? 1) : 0;
  return { state: target, takenAt: null, takenQuantity: null, stockDelta };
}
