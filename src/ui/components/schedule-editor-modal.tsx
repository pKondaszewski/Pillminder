import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { NewScheduleInput } from '@/schedules/dto/new-schedule-input';
import {
  previewOccurrences,
  type Schedule,
} from '@/schedules/schedule-service';
import type { Product } from '@/products/product-service';
import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';
import { Spacing } from '@/ui/constants/theme';

interface Props {
  visible: boolean;
  schedule: Schedule | null;
  products: Product[];
  onClose: () => void;
  onSave: (input: NewScheduleInput) => void;
  onDelete: (id: string) => void;
}

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatOccurrence(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month} · ${formatTime(date)}`;
}

export function ScheduleEditorModal({
  visible,
  schedule,
  products,
  onClose,
  onSave,
  onDelete,
}: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? (
        <EditorForm
          key={schedule?.id ?? 'new'}
          schedule={schedule}
          products={products}
          onClose={onClose}
          onSave={onSave}
          onDelete={onDelete}
        />
      ) : null}
    </Modal>
  );
}

function EditorForm({
  schedule,
  products,
  onClose,
  onSave,
  onDelete,
}: Omit<Props, 'visible'>) {
  const { t } = useTranslation();

  const [productId, setProductId] = useState(
    schedule?.productId ?? products[0]?.id ?? '',
  );
  const [intervalDays, setIntervalDays] = useState(schedule?.intervalDays ?? 1);
  const [times, setTimes] = useState<string[]>(schedule?.timesOfDay ?? []);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerValue, setPickerValue] = useState(new Date());

  const addTime = (date: Date) => {
    const formatted = formatTime(date);
    if (!times.includes(formatted)) {
      setTimes([...times, formatted].sort());
    }
  };

  const removeTime = (value: string) => {
    setTimes(times.filter((x) => x !== value));
  };

  const onValueChange = (_event: DateTimePickerChangeEvent, date: Date) => {
    if (Platform.OS === 'android') {
      setPickerOpen(false);
      addTime(date);
    } else {
      setPickerValue(date);
    }
  };

  const confirmIosTime = () => {
    addTime(pickerValue);
    setPickerOpen(false);
  };

  const preview = previewOccurrences(intervalDays, times);

  const handleSave = () => {
    if (productId === '' || times.length === 0) {
      return;
    }
    onSave({
      productId,
      intervalDays: Math.max(1, intervalDays),
      timesOfDay: times,
    });
  };

  const handleDelete = () => {
    if (!schedule) return;
    Alert.alert(t('schedule.deleteTitle'), t('schedule.deleteConfirm'), [
      { text: t('editor.cancel'), style: 'cancel' },
      {
        text: t('editor.delete'),
        style: 'destructive',
        onPress: () => onDelete(schedule.id),
      },
    ]);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <ThemedText type="subtitle">
            {schedule ? t('schedule.editTitle') : t('schedule.newTitle')}
          </ThemedText>

          <ThemedText type="small">{t('schedule.product')}</ThemedText>
          {products.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('schedule.noProducts')}
            </ThemedText>
          ) : (
            <ThemedView style={styles.chipsRow}>
              {products.map((p) => (
                <Pressable
                  key={p.id}
                  onPress={() => setProductId(p.id)}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedView
                    type={
                      p.id === productId
                        ? 'backgroundSelected'
                        : 'backgroundElement'
                    }
                    style={styles.chip}
                  >
                    <ThemedText
                      type="small"
                      themeColor={p.id === productId ? 'text' : 'textSecondary'}
                    >
                      {p.name}
                    </ThemedText>
                  </ThemedView>
                </Pressable>
              ))}
            </ThemedView>
          )}

          <ThemedText type="small">{t('schedule.intervalDays')}</ThemedText>
          <ThemedView style={styles.stepper}>
            <Pressable
              onPress={() => setIntervalDays(Math.max(1, intervalDays - 1))}
              hitSlop={Spacing.two}
              accessibilityLabel={t('schedule.intervalLess')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="backgroundElement" style={styles.stepperButton}>
                <ThemedText type="subtitle">−</ThemedText>
              </ThemedView>
            </Pressable>
            <ThemedText style={styles.stepperValue}>
              {intervalDays === 1
                ? t('schedule.daily')
                : t('schedule.everyXDaysShort', { days: intervalDays })}
            </ThemedText>
            <Pressable
              onPress={() => setIntervalDays(intervalDays + 1)}
              hitSlop={Spacing.two}
              accessibilityLabel={t('schedule.intervalMore')}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="backgroundElement" style={styles.stepperButton}>
                <ThemedText type="subtitle">+</ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>

          <ThemedText type="small">{t('schedule.timesOfDay')}</ThemedText>
          <ThemedView style={styles.chipsRow}>
            {times.map((time) => (
              <ThemedView
                key={time}
                type="backgroundSelected"
                style={styles.timeChip}
              >
                <ThemedText type="small">{time}</ThemedText>
                <Pressable
                  onPress={() => removeTime(time)}
                  hitSlop={Spacing.two}
                  accessibilityLabel={t('schedule.removeTime', { time })}
                  style={({ pressed }) => pressed && styles.pressed}
                >
                  <ThemedText type="small" themeColor="textSecondary">
                    ✕
                  </ThemedText>
                </Pressable>
              </ThemedView>
            ))}
            <Pressable
              onPress={() => setPickerOpen(true)}
              style={({ pressed }) => pressed && styles.pressed}
            >
              <ThemedView type="backgroundElement" style={styles.timeChip}>
                <ThemedText type="small" style={styles.addText}>
                  + {t('schedule.addTime')}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>

          {pickerOpen ? (
            <>
              <DateTimePicker
                value={pickerValue}
                mode="time"
                is24Hour
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onValueChange={onValueChange}
                onDismiss={() => setPickerOpen(false)}
              />
              {Platform.OS === 'ios' ? (
                <ThemedView style={styles.actions}>
                  <ActionButton
                    label={t('editor.cancel')}
                    onPress={() => setPickerOpen(false)}
                  />
                  <ActionButton
                    label={t('schedule.addTime')}
                    onPress={confirmIosTime}
                    color="#3c87f7"
                  />
                </ThemedView>
              ) : null}
            </>
          ) : null}

          <ThemedText type="small">{t('schedule.preview')}</ThemedText>
          {times.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('schedule.previewEmpty')}
            </ThemedText>
          ) : (
            <ThemedView type="backgroundElement" style={styles.previewBox}>
              {preview.map((occurrence) => (
                <ThemedText
                  key={occurrence.toISOString()}
                  type="small"
                  themeColor="textSecondary"
                >
                  {formatOccurrence(occurrence)}
                </ThemedText>
              ))}
              <ThemedText type="small" themeColor="textSecondary">
                …
              </ThemedText>
            </ThemedView>
          )}
        </ScrollView>

        <ThemedView style={styles.actions}>
          <ActionButton label={t('editor.close')} onPress={onClose} />
          {schedule ? (
            <ActionButton
              label={t('editor.delete')}
              onPress={handleDelete}
              color="#d9534f"
            />
          ) : null}
          <ActionButton
            label={t('editor.save')}
            onPress={handleSave}
            color="#3c87f7"
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

function ActionButton({
  label,
  onPress,
  color,
}: {
  label: string;
  onPress: () => void;
  color?: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.actionButtonInner}>
        <ThemedText type="smallBold" style={color ? { color } : undefined}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.three,
  },
  scrollContent: {
    gap: Spacing.two,
    paddingBottom: Spacing.four,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperValue: {
    minWidth: 110,
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  addText: {
    color: '#3c87f7',
    fontWeight: '600',
  },
  previewBox: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  actionButton: {
    flex: 1,
  },
  actionButtonInner: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
});
