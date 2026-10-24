import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import { deletionChange } from '@/config/undoable-change';
import {
  getNotesQuery,
  type Note,
  removeNote,
  restoreNote,
} from '@/notes/note-service';

export function useNotes(productId: string, runWithUndo: RunWithUndo) {
  const { t } = useTranslation();
  const { data } = useLiveQuery(getNotesQuery(productId), [productId]);

  const deleteNote = ({ id }: Note, onSuccess: () => void) =>
    runWithUndo(
      deletionChange(
        t('notes.deletedToast'),
        () => removeNote(id),
        restoreNote,
      ),
      'notes.errorDelete',
      onSuccess,
    );

  return { notes: data, deleteNote };
}
