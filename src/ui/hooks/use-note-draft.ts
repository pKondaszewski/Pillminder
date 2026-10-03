import { useState } from 'react';

import { addNote, editNote, type Note } from '@/notes/note-service';

export function useNoteDraft(productId: string | undefined) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');

  const canSubmit = draft.trim() !== '';

  const startEditing = (note: Note) => {
    setEditingId(note.id);
    setDraft(note.body);
  };

  const reset = () => {
    setEditingId(null);
    setDraft('');
  };

  const submit = async () => {
    if (!productId || !canSubmit) return;
    if (editingId) {
      await editNote(editingId, draft);
    } else {
      await addNote(productId, draft);
    }
    reset();
  };

  return {
    draft,
    editingId,
    canSubmit,
    setDraft,
    startEditing,
    reset,
    submit,
  };
}

export type NoteDraft = ReturnType<typeof useNoteDraft>;
