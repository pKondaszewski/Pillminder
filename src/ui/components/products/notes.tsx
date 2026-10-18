import type { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { Alert, Pressable, StyleSheet, TextInput } from 'react-native';

import type { Note } from '@/notes/note-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDateTime } from '@/ui/commons/format-date';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import type { NoteDraft } from '@/ui/hooks/use-note-draft';
import { useNotes } from '@/ui/hooks/use-notes';
import { useTheme } from '@/ui/hooks/use-theme';

export function ProductNotes({
  productId,
  noteDraft,
}: {
  productId: string;
  noteDraft: NoteDraft;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { notes, removeNote } = useNotes(productId);
  const { draft, editingId, canSubmit, setDraft, startEditing, reset, submit } =
    noteDraft;

  const handleSubmit = async () => {
    try {
      await submit();
    } catch {
      Alert.alert(t('products.errorTitle'), t('notes.errorSave'));
    }
  };

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="small">{t('notes.title')}</ThemedText>
      {notes.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('notes.empty')}
        </ThemedText>
      ) : (
        notes.map((note) => (
          <ThemedView key={note.id} type="surface" style={styles.note}>
            <ThemedText type="small" themeColor="textSecondary">
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
                onPress={() =>
                  confirmDeleteNote(note, editingId, t, removeNote, reset)
                }
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
      <TextInput
        value={draft}
        onChangeText={setDraft}
        multiline
        placeholder={t('notes.placeholder')}
        placeholderTextColor={theme.textSecondary}
        style={[
          styles.input,
          { color: theme.text, borderColor: theme.borderStrong },
        ]}
      />
      <ThemedView style={styles.noteActions}>
        {editingId ? (
          <Pressable
            onPress={reset}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedText type="smallBold" themeColor="textSecondary">
              {t('editor.cancel')}
            </ThemedText>
          </Pressable>
        ) : null}
        <Pressable
          onPress={handleSubmit}
          disabled={!canSubmit}
          style={({ pressed }) => [
            pressed && styles.pressed,
            !canSubmit && styles.disabled,
          ]}
        >
          <ThemedText type="smallBold" themeColor="accent">
            {editingId ? t('editor.save') : t('notes.add')}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

function confirmDeleteNote(
  note: Note,
  editingId: string | null,
  t: TFunction,
  removeNote: (id: string) => Promise<void>,
  reset: () => void,
) {
  Alert.alert(t('notes.deleteTitle'), t('notes.deleteConfirm'), [
    { text: t('editor.cancel'), style: 'cancel' },
    {
      text: t('editor.delete'),
      style: 'destructive',
      onPress: async () => {
        try {
          await removeNote(note.id);
          if (note.id === editingId) reset();
        } catch {
          Alert.alert(t('products.errorTitle'), t('notes.errorDelete'));
        }
      },
    },
  ]);
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.eight,
    marginTop: Spacing.sixteen,
  },
  note: {
    gap: Spacing.four,
    padding: Spacing.sixteen,
    borderRadius: Spacing.eight,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.twentyFour,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.eight,
    paddingHorizontal: Spacing.sixteen,
    paddingVertical: Spacing.eight,
    fontSize: 16,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
