import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import { createLogger } from '@/config/logger';
import type {
  CorrectionTarget,
  DoseSnapshot,
  TodayDose,
} from '@/doses/dose-service';
import { bulkTakeChange, doseCorrectionChange } from '@/doses/dose-undo';

type DoseFn = (id: string) => Promise<void>;

interface Corrections {
  correct: (id: string, target: CorrectionTarget) => Promise<void>;
  restore: (snapshot: DoseSnapshot) => Promise<void>;
}

export type UndoableKind = 'taken' | 'skipped';

const DOSE_ACTION_TOAST_KEYS: Record<UndoableKind, string> = {
  taken: 'home.takenToast',
  skipped: 'home.skippedToast',
};

const log = createLogger('use-undoable-dose-action');

export function useUndoableDoseAction(
  actions: Record<UndoableKind, { apply: DoseFn; revert: DoseFn }>,
  { correct, restore }: Corrections,
) {
  const { t } = useTranslation();
  const { snackbar, showUndo, runWithUndo } = useUndoSnackbar();

  const reportFailure = (what: string, err: unknown) => {
    log.error(`Failed to ${what}`, err);
    Alert.alert(t('common.errorTitle'), t('home.errorChangeDose'));
  };

  const applyWithUndo = async (
    kind: UndoableKind,
    { id, productName }: TodayDose,
  ) => {
    try {
      await actions[kind].apply(id);
    } catch (err) {
      reportFailure(`mark dose ${id} as ${kind}`, err);
      return;
    }
    showUndo(t(DOSE_ACTION_TOAST_KEYS[kind], { name: productName }), () =>
      revert(kind, id),
    );
  };

  const correctWithUndo = (dose: TodayDose, target: CorrectionTarget) =>
    runWithUndo(
      doseCorrectionChange(
        dose,
        target,
        t(DOSE_ACTION_TOAST_KEYS[target], { name: dose.productName }),
        correct,
        restore,
      ),
      'home.errorChangeDose',
    );

  const takeAll = (doses: TodayDose[]) =>
    runWithUndo(
      bulkTakeChange(
        doses,
        t('home.bulkTakenToast', { count: doses.length }),
        actions.taken.apply,
        restore,
      ),
      'home.bulkTakeError',
    );

  const revert = async (kind: UndoableKind, id: string) => {
    try {
      await actions[kind].revert(id);
    } catch (err) {
      reportFailure(`revert dose ${id} from ${kind}`, err);
    }
  };

  return {
    snackbar,
    runWithUndo,
    applyWithUndo,
    correctWithUndo,
    takeAll,
    revert,
  };
}
