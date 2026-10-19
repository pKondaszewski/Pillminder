import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import { createLogger } from '@/config/logger';
import type { TodayDose } from '@/doses/dose-service';

type DoseFn = (id: string) => Promise<void>;
export type UndoableKind = 'taken' | 'skipped';

const DOSE_ACTION_TOAST_KEYS: Record<UndoableKind, string> = {
  taken: 'home.takenToast',
  skipped: 'home.skippedToast',
};

const log = createLogger('use-undoable-dose-action');

export function useUndoableDoseAction(
  actions: Record<UndoableKind, { apply: DoseFn; revert: DoseFn }>,
) {
  const { t } = useTranslation();
  const { snackbar, showUndo, dismissUndo } = useUndoSnackbar();

  const reportFailure = (what: string, err: unknown) => {
    log.error(`Failed to ${what}`, err);
    Alert.alert(t('products.errorTitle'), t('history.errorCorrect'));
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

  const takeAll = async (ids: string[]) => {
    dismissUndo();
    let failed = 0;
    for (const id of ids) {
      try {
        await actions.taken.apply(id);
      } catch (err) {
        failed += 1;
        log.error(`Failed to mark dose ${id} as taken`, err);
      }
    }
    if (failed > 0) {
      Alert.alert(t('products.errorTitle'), t('home.bulkTakeError'));
    }
  };

  const revert = async (kind: UndoableKind, id: string) => {
    try {
      await actions[kind].revert(id);
    } catch (err) {
      reportFailure(`revert dose ${id} from ${kind}`, err);
    }
  };

  return { snackbar, applyWithUndo, takeAll, revert };
}
