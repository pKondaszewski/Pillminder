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
      // save failed — keep the draft so the text is not lost
    }
  };

  const handleDelete = (note: Note) => {
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
            // delete failed — note stays in the list
          }
        },
      },
    ]);
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
          <ThemedView
            key={note.id}
            type="backgroundElement"
            style={styles.note}
          >
            <ThemedText type="small" themeColor="textSecondary">
              {formatDateTime(note.createdAt)}
              {note.updatedAt > note.createdAt ? ` · ${t('notes.edited')}` : ''}
            </ThemedText>
            <ThemedText>{note.body}</ThemedText>
            <ThemedView type="backgroundElement" style={styles.noteActions}>
              <Pressable
                onPress={() => startEditing(note)}
                hitSlop={Spacing.two}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedText type="smallBold" themeColor="accent">
                  {t('notes.edit')}
                </ThemedText>
              </Pressable>
              <Pressable
                onPress={() => handleDelete(note)}
                hitSlop={Spacing.two}
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
          { color: theme.text, borderColor: theme.backgroundSelected },
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

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  note: {
    gap: Spacing.one,
    padding: Spacing.three,
    borderRadius: Spacing.two,
  },
  noteActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.four,
  },
  input: {
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
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
