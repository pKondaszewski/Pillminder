import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NewScheduleInput } from '@/schedules/dto/new-schedule-input';
import type { Schedule } from '@/schedules/schedule-service';
import { ScheduleEditorModal } from '@/ui/components/schedule-editor-modal';
import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';
import { Spacing } from '@/ui/constants/theme';
import { useProducts } from '@/ui/hooks/use-products';
import { useSchedules } from '@/ui/hooks/use-schedules';

export default function ScheduleListScreen() {
  const { t } = useTranslation();
  const { products } = useProducts();
  const { schedules, addSchedule, editSchedule, removeSchedule } =
    useSchedules();

  const [editorOpen, setEditorOpen] = useState(false);
  const [editing, setEditing] = useState<Schedule | null>(null);

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? t('schedule.unknownProduct');

  const rhythm = (s: Schedule) => {
    const base =
      s.intervalDays === 1
        ? t('schedule.daily')
        : t('schedule.everyXDaysShort', { days: s.intervalDays });
    return `${base} · ${s.timesOfDay.join(', ')}`;
  };

  const openCreate = () => {
    setEditing(null);
    setEditorOpen(true);
  };

  const openEdit = (schedule: Schedule) => {
    setEditing(schedule);
    setEditorOpen(true);
  };

  const closeEditor = () => setEditorOpen(false);

  const handleSave = async (input: NewScheduleInput) => {
    try {
      if (editing) {
        await editSchedule(editing.id, input);
      } else {
        await addSchedule(input);
      }
      closeEditor();
    } catch {
      // save failed — keep modal open so the user's input is not lost
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await removeSchedule(id);
      closeEditor();
    } catch {
      // delete failed — keep modal open
    }
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <FlatList
          data={schedules}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => openEdit(item)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="backgroundElement" style={styles.row}>
                <ThemedText>{productName(item.productId)}</ThemedText>
                <ThemedText type="small">{rhythm(item)}</ThemedText>
              </ThemedView>
            </Pressable>
          )}
          ListEmptyComponent={
            <ThemedText type="small">{t('schedule.empty')}</ThemedText>
          }
          ListFooterComponent={
            <Pressable
              onPress={openCreate}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="backgroundElement" style={styles.addRow}>
                <ThemedText style={styles.addText}>
                  + {t('schedule.add')}
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
      />
    </ThemedView>
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
    color: '#3c87f7',
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
