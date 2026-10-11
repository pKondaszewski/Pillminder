import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NewScheduleInput } from '@/schedules/dto/new-schedule-input';
import { describeRhythm, type Schedule } from '@/schedules/schedule-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDate } from '@/ui/commons/format-date';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { ScheduleEditorModal } from '@/ui/components/schedules/editor-modal';
import { useProducts } from '@/ui/hooks/use-products';
import { useRunThenCloseEditor } from '@/ui/hooks/use-run-then-close-editor';
import { useSchedules } from '@/ui/hooks/use-schedules';

export default function ScheduleListScreen() {
  const { t } = useTranslation();
  const { products } = useProducts();
  const {
    schedules,
    addSchedule,
    editSchedule,
    removeSchedule,
    pauseSchedule,
    resumeSchedule,
  } = useSchedules();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);

  const findProduct = (id: string) => products.find((p) => p.id === id);

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (schedule: Schedule) => {
    setEditing(schedule);
    setEditorOpen(true);
  };

  const closeEditor = () => setEditorOpen(false);

  const now = new Date();

  const renderItem = ({ item }: { item: Schedule }) => {
    const product = findProduct(item.productId);
    return (
      <Pressable
        onPress={() => openEdit(item)}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedView type="backgroundElement" style={styles.row}>
          <ThemedText>
            {product?.name ?? t('schedule.unknownProduct')}
          </ThemedText>
          <ThemedText type="small">
            {describeRhythm(item, t, formatDate, product?.unit ?? null, now)}
          </ThemedText>
        </ThemedView>
      </Pressable>
    );
  };

  const runThenCloseEditor = useRunThenCloseEditor(closeEditor);

  const handleSave = (input: NewScheduleInput) =>
    runThenCloseEditor(
      () => (editing ? editSchedule(editing.id, input) : addSchedule(input)),
      'schedule.errorSave',
    );

  const handleDelete = (id: string) =>
    runThenCloseEditor(() => removeSchedule(id), 'schedule.errorDelete');

  const handlePause = (id: string, resumeAt: Date | null) =>
    runThenCloseEditor(
      () => pauseSchedule(id, resumeAt),
      'schedule.errorPause',
    );

  const handleResume = (id: string) =>
    runThenCloseEditor(() => resumeSchedule(id), 'schedule.errorResume');

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FlatList
            data={schedules}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            ListFooterComponent={
              <Pressable
                onPress={openCreate}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedView type="backgroundElement" style={styles.addRow}>
                  <ThemedText themeColor="accent" style={styles.addText}>
                    {t('schedule.add')}
                  </ThemedText>
                </ThemedView>
              </Pressable>
            }
          />
        </SafeAreaView>

        <ScheduleEditorModal
          visible={editorOpen}
          schedule={editing}
          products={products}
          onClose={closeEditor}
          onSave={handleSave}
          onDelete={handleDelete}
          onPause={handlePause}
          onResume={handleResume}
        />
      </ThemedView>
    </TabSwipe>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  list: {
    gap: Spacing.two,
    paddingVertical: Spacing.three,
  },
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  addRow: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  addText: {
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
