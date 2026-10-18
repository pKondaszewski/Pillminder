import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet } from 'react-native';

import type { Note } from '@/notes/note-service';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { SecondaryButton } from '@/ui/components/commons/button';
import { ConfirmDialog } from '@/ui/components/commons/confirm-dialog';
import { TextField } from '@/ui/components/commons/text-field';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { ProductSection } from '@/ui/components/products/section';
import { useConfirmation } from '@/ui/hooks/use-confirmation';
import { useFormatTime } from '@/ui/hooks/use-format-date';
import { useNoteDraft } from '@/ui/hooks/use-note-draft';
import { useNotes } from '@/ui/hooks/use-notes';

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
      Alert.alert(t('products.errorTitle'), t('notes.errorDelete'));
    }
  });

  const handleSubmit = async () => {
    try {
      await submit();
    } catch {
      Alert.alert(t('products.errorTitle'), t('notes.errorSave'));
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
