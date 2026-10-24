import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { SecondaryButton } from '@/commons/ui/button';
import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { TextField } from '@/commons/ui/text-field';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatTime } from '@/commons/ui/use-format-date';
import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import type { Note } from '@/notes/note-service';
import { ProductSection } from '@/products/ui/section';
import { useNoteDraft } from '@/products/ui/use-note-draft';
import { useNotes } from '@/products/ui/use-notes';

interface Props {
  productId: string;
  runWithUndo: RunWithUndo;
}

export function ProductNotes({ productId, runWithUndo }: Props) {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatTime();
  const { notes, deleteNote } = useNotes(productId, runWithUndo);
  const { draft, editingId, canSubmit, setDraft, startEditing, reset, submit } =
    useNoteDraft(productId);

  const handleDelete = (note: Note) =>
    deleteNote(note, () => {
      if (note.id === editingId) reset();
    });

  const handleSubmit = async () => {
    try {
      await submit();
    } catch {
      Alert.alert(t('common.errorTitle'), t('notes.errorSave'));
    }
  };

  return (
    <ProductSection title={t('notes.title')}>
      {notes.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('notes.empty')}
        </ThemedText>
      ) : (
        notes.map((note) => (
          <ThemedView key={note.id} type="surface" style={styles.note}>
            <ThemedText type="caption">
              {formatDateTime(note.createdAt)}
              {note.updatedAt > note.createdAt ? ` · ${t('notes.edited')}` : ''}
            </ThemedText>
            <ThemedText>{note.body}</ThemedText>
            <ThemedView type="surface" style={styles.noteActions}>
              <Pressable
                onPress={() => startEditing(note)}
                hitSlop={Spacing.eight}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedText type="smallBold" themeColor="accent">
                  {t('notes.edit')}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(note)}
                hitSlop={Spacing.eight}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedText type="smallBold" themeColor="danger">
                  {t('editor.delete')}
                </ThemedText>
              </Pressable>
            </ThemedView>
          </ThemedView>
        ))
      )}
      <TextField
        value={draft}
        onChangeText={setDraft}
        multiline
        placeholder={t('notes.placeholder')}
        accessibilityLabel={t('notes.placeholder')}
      />
      <ThemedView style={styles.draftActions}>
        {editingId ? (
          <SecondaryButton label={t('editor.cancel')} onPress={reset} />
        ) : null}
        <SecondaryButton
          label={editingId ? t('editor.save') : t('notes.add')}
          onPress={handleSubmit}
          disabled={!canSubmit}
        />
      </ThemedView>
    </ProductSection>
  );
}

const styles = StyleSheet.create({
  note: {
    gap: Spacing.four,
    padding: Spacing.sixteen,
    borderRadius: Radius.button,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.twentyFour,
  },
  draftActions: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
  pressed: {
    opacity: 0.7,
  },
});
