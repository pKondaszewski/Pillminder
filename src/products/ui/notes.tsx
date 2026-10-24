import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet } from 'react-native';

import { SecondaryButton } from '@/commons/ui/button';
import { ConfirmDialog } from '@/commons/ui/confirm-dialog';
import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { TextField } from '@/commons/ui/text-field';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useConfirmation } from '@/commons/ui/use-confirmation';
import { useFormatTime } from '@/commons/ui/use-format-date';
import type { Note } from '@/notes/note-service';
import { ProductSection } from '@/products/ui/section';
import { useNoteDraft } from '@/products/ui/use-note-draft';
import { useNotes } from '@/products/ui/use-notes';

export function ProductNotes({ productId }: { productId: string }) {
  const { t } = useTranslation();
  const { formatDateTime } = useFormatTime();
  const { notes, removeNote } = useNotes(productId);
  const { draft, editingId, canSubmit, setDraft, startEditing, reset, submit } =
    useNoteDraft(productId);

  const deletion = useConfirmation<Note>(async (note) => {
    try {
      await removeNote(note.id);
      if (note.id === editingId) reset();
    } catch {
      Alert.alert(t('common.errorTitle'), t('notes.errorDelete'));
    }
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
                onPress={() => deletion.request(note)}
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
      <ConfirmDialog
        visible={deletion.pending !== null}
        destructive
        title={t('notes.deleteTitle')}
        message={t('notes.deleteConfirm')}
        confirmLabel={t('editor.delete')}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
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
