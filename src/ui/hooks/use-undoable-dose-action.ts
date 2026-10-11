import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { createLogger } from '@/config/logger';

type DoseFn = (id: string) => Promise<void>;
export type UndoableKind = 'taken' | 'skipped';

interface Undoable {
  id: string;
  kind: UndoableKind;
}

const log = createLogger('use-undoable-dose-action');

/**
 * Wraps take/skip so the just-changed dose can be reverted from a snackbar.
 * `undoable` is the dose still within its undo window (null when none).
 */
export function useUndoableDoseAction(
  actions: Record<UndoableKind, { apply: DoseFn; revert: DoseFn }>,
) {
  const { t } = useTranslation();
  const [undoable, setUndoable] = useState<Undoable | null>(null);

  const reportFailure = (what: string, err: unknown) => {
    log.error(`Failed to ${what}`, err);
    Alert.alert(t('products.errorTitle'), t('history.errorCorrect'));
  };

  const applyWithUndo = async (kind: UndoableKind, id: string) => {
    try {
      await actions[kind].apply(id);
    } catch (err) {
      reportFailure(`mark dose ${id} as ${kind}`, err);
      return;
    }
    setUndoable({ id, kind });
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

  return { undoable, applyWithUndo, revert, undoLast, dismissUndo };
}
