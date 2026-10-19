import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import type { UndoableChange } from '@/config/undoable-change';

export interface UndoSnackbarState {
  key: number;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
}

interface Pending {
  key: number;
  message: string;
  undo: () => Promise<void> | void;
}

export type RunWithUndo = ReturnType<typeof useUndoSnackbar>['runWithUndo'];

export function useUndoSnackbar() {
  const { t } = useTranslation();
  const lastKey = useRef(0);
  const [pending, setPending] = useState<Pending | null>(null);

  const dismissUndo = () => setPending(null);

  const showUndo = (message: string, undo: Pending['undo']) => {
    lastKey.current += 1;
    setPending({ key: lastKey.current, message, undo });
  };

  const alertFailure = (errorKey: string) =>
    Alert.alert(t('products.errorTitle'), t(errorKey));

  const runWithUndo = async (
    { message, apply, revert }: UndoableChange,
    errorKey: string,
    onSuccess?: () => void,
  ) => {
    try {
      await apply();
    } catch {
      alertFailure(errorKey);
      return;
    }
    onSuccess?.();
    showUndo(message, async () => {
      try {
        await revert();
      } catch {
        alertFailure(errorKey);
      }
    });
  };

  const snackbar: UndoSnackbarState | null = pending && {
    key: pending.key,
    message: pending.message,
    actionLabel: t('home.undo'),
    onAction: () => {
      dismissUndo();
      void pending.undo();
    },
    onDismiss: dismissUndo,
  };

  return { snackbar, showUndo, dismissUndo, runWithUndo };
}
