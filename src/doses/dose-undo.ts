import type { UndoableChange } from '@/config/undoable-change';

import type { CorrectionTarget } from './dto/correction-target';
import type { DoseSnapshot } from './dto/dose-snapshot';

type RestoreDose = (snapshot: DoseSnapshot) => Promise<void>;

export function doseCorrectionChange(
  dose: DoseSnapshot,
  target: CorrectionTarget,
  message: string,
  correct: (id: string, target: CorrectionTarget) => Promise<void>,
  restore: RestoreDose,
): UndoableChange {
  return {
    message,
    apply: () => correct(dose.id, target),
    revert: () => restore(dose),
  };
}

export function bulkTakeChange(
  doses: DoseSnapshot[],
  message: string,
  take: (id: string) => Promise<void>,
  restore: RestoreDose,
): UndoableChange {
  return {
    message,
    apply: async () => {
      const taken: DoseSnapshot[] = [];
      try {
        for (const dose of doses) {
          await take(dose.id);
          taken.push(dose);
        }
      } catch (err) {
        await restoreAll(taken, restore);
        throw err;
      }
    },
    revert: () => restoreAll(doses, restore),
  };
}

async function restoreAll(
  doses: DoseSnapshot[],
  restore: RestoreDose,
): Promise<void> {
  for (const dose of doses) await restore(dose);
}
