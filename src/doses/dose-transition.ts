export type DoseState = 'pending' | 'taken' | 'skipped';

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
  now: Date,
): DoseTransition | null {
  if (dose.state === target) return null;

  if (target === 'taken') {
    return {
      state: target,
      takenAt: now,
      takenQuantity: scheduleQuantity,
      stockDelta: -scheduleQuantity,
    };
  }

  // Leaving "taken" restores what was actually deducted; doses taken before
  // quantities existed have no snapshot and consumed exactly one unit.
  const stockDelta = dose.state === 'taken' ? (dose.takenQuantity ?? 1) : 0;
  return { state: target, takenAt: null, takenQuantity: null, stockDelta };
}
