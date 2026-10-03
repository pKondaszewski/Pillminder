import { useCallback, useState } from 'react';

type DoseFn = (id: string) => void;
export type UndoableKind = 'taken' | 'skipped';

interface Undoable {
  id: string;
  kind: UndoableKind;
}

/**
 * Wraps take/skip so the just-changed dose can be reverted from a snackbar.
 * `undoable` is the dose still within its undo window (null when none).
 */
export function useUndoableDoseAction(
  actions: Record<UndoableKind, { apply: DoseFn; revert: DoseFn }>,
) {
  const [undoable, setUndoable] = useState<Undoable | null>(null);

  const applyWithUndo = useCallback(
    (kind: UndoableKind, id: string) => {
      actions[kind].apply(id);
      setUndoable({ id, kind });
    },
    [actions],
  );

  const undoLast = useCallback(() => {
    setUndoable((prev) => {
      if (prev) actions[prev.kind].revert(prev.id);
      return null;
    });
  }, [actions]);

  const dismissUndo = useCallback(() => setUndoable(null), []);

  return { undoable, applyWithUndo, undoLast, dismissUndo };
}
