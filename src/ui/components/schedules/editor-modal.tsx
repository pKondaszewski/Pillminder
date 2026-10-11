import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addDays, startOfDay } from '@/config/date-utils';
import type { Product } from '@/products/product-service';
import { formatAmount } from '@/products/product-unit';
import type { NewScheduleInput } from '@/schedules/dto/new-schedule-input';
import {
  describePause,
  isPaused,
  previewOccurrences,
  type Schedule,
} from '@/schedules/schedule-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDate, formatTime } from '@/ui/commons/format-date';
import { ActionButton } from '@/ui/components/commons/action-button';
import { Chip } from '@/ui/components/commons/chip';
import { StepperButton } from '@/ui/components/commons/stepper-button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

interface Props {
  visible: boolean;
  schedule: Schedule | null;
  products: Product[];
  onClose: () => void;
  onSave: (input: NewScheduleInput) => void;
  onDelete: (id: string) => void;
  onPause: (id: string, resumeAt: Date | null) => void;
  onResume: (id: string) => void;
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
  onPause,
  onResume,
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
          onPause={onPause}
          onResume={onResume}
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
  onPause,
  onResume,
}: Omit<Props, 'visible'>) {
  const { t } = useTranslation();

  const [productId, setProductId] = useState(
    schedule?.productId ?? products[0]?.id ?? '',
  );
  const unit = products.find((p) => p.id === productId)?.unit ?? null;
  const [intervalDays, setIntervalDays] = useState(schedule?.intervalDays ?? 1);
  const [times, setTimes] = useState<string[]>(schedule?.timesOfDay ?? []);
  const [quantity, setQuantity] = useState(schedule?.quantity ?? 1);
  const [startDate, setStartDate] = useState<Date | null>(
    schedule?.startDate ?? null,
  );
  const [endDate, setEndDate] = useState<Date | null>(
    schedule?.endDate ?? null,
  );
  const [resumeDate, setResumeDate] = useState<Date | null>(null);
  const [datePickerFor, setDatePickerFor] = useState<
    'start' | 'end' | 'resume' | null
  >(null);
  const [pickerOpen, setPickerOpen] = useState(false);

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
    setPickerOpen(false);
    addTime(date);
  };

  const periodInvalid =
    startDate !== null && endDate !== null && endDate < startDate;

  const onDateChange = (_event: DateTimePickerChangeEvent, date: Date) => {
    const day = new Date(date);
    day.setHours(0, 0, 0, 0);
    if (datePickerFor === 'start') setStartDate(day);
    if (datePickerFor === 'end') setEndDate(day);
    if (datePickerFor === 'resume') setResumeDate(day);
    setDatePickerFor(null);
  };

  const paused = schedule !== null && isPaused(schedule, new Date());
  const preview = periodInvalid
    ? []
    : previewOccurrences(intervalDays, times, {
        startDate,
        endDate,
        pausedAt: schedule?.pausedAt,
        resumeAt: schedule?.resumeAt,
      });

  const handleSave = () => {
    if (productId === '' || times.length === 0 || periodInvalid) {
      return;
    }
    onSave({
      productId,
      intervalDays: Math.max(1, intervalDays),
      timesOfDay: times,
      quantity: Math.max(1, quantity),
      startDate,
      endDate,
    });
  };

  const handlePause = () => {
    if (schedule) onPause(schedule.id, resumeDate);
  };

  const handleResume = () => {
    if (schedule) onResume(schedule.id);
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
                <Chip
                  key={p.id}
                  label={p.name}
                  selected={p.id === productId}
                  onPress={() => setProductId(p.id)}
                />
              ))}
            </ThemedView>
          )}

          <ThemedText type="small">{t('schedule.intervalDays')}</ThemedText>
          <ThemedView style={styles.stepper}>
            <StepperButton
              sign="−"
              accessibilityLabel={t('schedule.intervalLess')}
              onPress={() => setIntervalDays(Math.max(1, intervalDays - 1))}
            />
            <ThemedText style={styles.stepperValue}>
              {intervalDays === 1
                ? t('schedule.daily')
                : t('schedule.everyXDays', { days: intervalDays })}
            </ThemedText>
            <StepperButton
              sign="+"
              accessibilityLabel={t('schedule.intervalMore')}
              onPress={() => setIntervalDays(intervalDays + 1)}
            />
          </ThemedView>

          <ThemedText type="small">{t('schedule.quantity')}</ThemedText>
          <ThemedView style={styles.stepper}>
            <StepperButton
              sign="−"
              accessibilityLabel={t('schedule.quantityLess')}
              onPress={() => setQuantity(Math.max(1, quantity - 1))}
            />
            <ThemedText style={styles.stepperValue}>
              {unit ? formatAmount(quantity, unit, t) : quantity}
            </ThemedText>
            <StepperButton
              sign="+"
              accessibilityLabel={t('schedule.quantityMore')}
              onPress={() => setQuantity(quantity + 1)}
            />
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
                <ThemedText
                  type="small"
                  themeColor="accent"
                  style={styles.addText}
                >
                  + {t('schedule.addTime')}
                </ThemedText>
              </ThemedView>
            </Pressable>
          </ThemedView>

          {pickerOpen ? (
            <DateTimePicker
              value={new Date()}
              mode="time"
              is24Hour
              onValueChange={onValueChange}
              onDismiss={() => setPickerOpen(false)}
            />
          ) : null}

          <ThemedText type="small">{t('schedule.periodStart')}</ThemedText>
          <DateField
            value={startDate}
            onPick={() => setDatePickerFor('start')}
            onClear={() => setStartDate(null)}
          />
          <ThemedText type="small">{t('schedule.periodEnd')}</ThemedText>
          <DateField
            value={endDate}
            onPick={() => setDatePickerFor('end')}
            onClear={() => setEndDate(null)}
          />
          {periodInvalid ? (
            <ThemedText type="small" themeColor="danger">
              {t('schedule.periodInvalid')}
            </ThemedText>
          ) : null}
          {datePickerFor ? (
            <DateTimePicker
              value={pickedDateValue(datePickerFor, {
                start: startDate,
                end: endDate,
                resume: resumeDate,
              })}
              minimumDate={datePickerFor === 'resume' ? tomorrow() : undefined}
              mode="date"
              onValueChange={onDateChange}
              onDismiss={() => setDatePickerFor(null)}
            />
          ) : null}

          {schedule ? (
            <>
              <ThemedText type="small">{t('schedule.pause')}</ThemedText>
              {paused ? (
                <ThemedView style={styles.dateRow}>
                  <ThemedText type="small" themeColor="textSecondary">
                    {describePause(schedule, t, formatDate)}
                  </ThemedText>
                  <ActionButton
                    label={t('schedule.resume')}
                    onPress={handleResume}
                    themeColor="accent"
                  />
                </ThemedView>
              ) : (
                <>
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('schedule.resumeDate')}
                  </ThemedText>
                  <DateField
                    value={resumeDate}
                    onPick={() => setDatePickerFor('resume')}
                    onClear={() => setResumeDate(null)}
                  />
                  <ActionButton
                    label={t('schedule.pauseAction')}
                    onPress={handlePause}
                  />
                </>
              )}
            </>
          ) : null}

          <ThemedText type="small">{t('schedule.preview')}</ThemedText>
          {times.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('schedule.previewEmpty')}
            </ThemedText>
          ) : preview.length === 0 ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('schedule.previewNone')}
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
              themeColor="danger"
            />
          ) : null}
          <ActionButton
            label={t('editor.save')}
            onPress={handleSave}
            themeColor="accent"
          />
        </ThemedView>
      </SafeAreaView>
    </ThemedView>
  );
}

function pickedDateValue(
  field: 'start' | 'end' | 'resume',
  dates: { start: Date | null; end: Date | null; resume: Date | null },
): Date {
  return dates[field] ?? (field === 'resume' ? tomorrow() : new Date());
}

function tomorrow(): Date {
  return addDays(startOfDay(new Date()), 1);
}

function DateField({
  value,
  onPick,
  onClear,
}: {
  value: Date | null;
  onPick: () => void;
  onClear: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.dateRow}>
      <Pressable
        onPress={onPick}
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedView type="backgroundElement" style={styles.timeChip}>
          <ThemedText
            type="small"
            themeColor={value ? 'text' : 'textSecondary'}
          >
            {value ? formatDate(value) : t('schedule.periodNone')}
          </ThemedText>
        </ThemedView>
      </Pressable>
      {value ? (
        <Pressable
          onPress={onClear}
          hitSlop={Spacing.two}
          accessibilityLabel={t('schedule.periodClear')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedText type="small" themeColor="textSecondary">
            ✕
          </ThemedText>
        </Pressable>
      ) : null}
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
  timeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  addText: {
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
});
