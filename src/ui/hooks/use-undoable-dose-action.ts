import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { createLogger } from '@/config/logger';
import type { TodayDose } from '@/doses/dose-service';

type DoseFn = (id: string) => Promise<void>;
export type UndoableKind = 'taken' | 'skipped';

interface Undoable {
  id: string;
  name: string;
  kind: UndoableKind;
}

const log = createLogger('use-undoable-dose-action');

export function useUndoableDoseAction(
  actions: Record<UndoableKind, { apply: DoseFn; revert: DoseFn }>,
) {
  const { t } = useTranslation();
  const [undoable, setUndoable] = useState<Undoable | null>(null);

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
    setUndoable({ id, name: productName, kind });
  };

  const takeAll = async (ids: string[]) => {
    setUndoable(null);
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

  const undoLast = async () => {
    if (!undoable) return;
    setUndoable(null);
    await revert(undoable.kind, undoable.id);
  };

  const dismissUndo = () => setUndoable(null);

  return { undoable, applyWithUndo, takeAll, revert, undoLast, dismissUndo };
}
