import { useCallback, useState } from 'react';

type TakeFn = (id: string) => void;

/**
 * Wraps take/untake so the just-taken dose can be reverted from a snackbar.
 * `undoableId` is the dose still within its undo window (null when none).
 */
export function useUndoableTake(takeDose: TakeFn, untakeDose: TakeFn) {
  const [undoableId, setUndoableId] = useState<string | null>(null);

  const takeWithUndo = useCallback(
    (id: string) => {
      takeDose(id);
      setUndoableId(id);
    },
    [takeDose],
  );

  const undoLast = useCallback(() => {
    setUndoableId((prevId) => {
      if (prevId) untakeDose(prevId);
      return null;
    });
  }, [untakeDose]);

  const dismissUndo = useCallback(() => setUndoableId(null), []);

  return { undoableId, takeWithUndo, undoLast, dismissUndo };
}
