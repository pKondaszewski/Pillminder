import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';

import { DestructiveButton, SecondaryButton } from '@/commons/ui/button';
import { ConfirmDialog } from '@/commons/ui/confirm-dialog';
import { Spacing } from '@/commons/ui/constants/theme';
import { FieldRow } from '@/commons/ui/field-row';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import {
  useFirstWeekday,
  useFormatDate,
  useFormatTime,
} from '@/commons/ui/use-format-date';
import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import type { Translate } from '@/config/translate';
import type { Product } from '@/products/product-service';
import { reorderStatus } from '@/products/reorder';
import { useProducts } from '@/products/ui/use-products';
import { courseProgress } from '@/schedules/schedule-list';
import {
  describeAmount,
  describeCourse,
  describeDays,
  describePeriod,
  hasFiniteTaper,
  isPaused,
  previewOccurrences,
  type Schedule,
} from '@/schedules/schedule-service';
import { describeStockSufficiency } from '@/schedules/stock-sufficiency';
import { CourseProgressBar } from '@/schedules/ui/course-progress';
import { DosePreview } from '@/schedules/ui/dose-preview';
import {
  type ScheduleField,
  ScheduleFieldSheet,
} from '@/schedules/ui/field-sheets';
import { ScheduleProductCard } from '@/schedules/ui/product-card';
import { useScheduleEditActions } from '@/schedules/ui/use-schedule-edit-actions';
import { useSchedules } from '@/schedules/ui/use-schedules';

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const { formatTimes } = useFormatTime();
  const firstWeekday = useFirstWeekday();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products, restoreProduct } = useProducts();
  const { schedules, removeSchedule } = useSchedules();
  const [field, setField] = useState<ScheduleField | null>(null);
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const { snackbar, runWithUndo } = useUndoSnackbar();
  const edit = useScheduleEditActions(runWithUndo);
  const runThenGoBack = useRunWithErrorAlert(() => router.back());
  const runWithAlert = useRunWithErrorAlert();

  const schedule = schedules.find((s) => s.id === id);
  const product = products.find((p) => p.id === schedule?.productId);
  if (!schedule || !product) return null;

  const now = new Date();
  const productArchived = product.status === 'archived';
  const paused = isPaused(schedule, now);
  const progress = courseProgress(schedule, now);
  const stock =
    paused || productArchived
      ? null
      : scheduleStockSufficiency(
          schedule,
          schedules,
          product,
          now,
          t,
          formatDate,
        );
  const statusMessageKey = productArchived
    ? 'schedule.productArchivedPaused'
    : paused
      ? 'schedule.paused'
      : null;
  const stateAction = productArchived
    ? {
        labelKey: 'schedule.restoreProduct',
        onPress: () =>
          runWithAlert(
            () => restoreProduct(product.id),
            'schedule.errorRestoreProduct',
          ),
      }
    : paused
      ? {
          labelKey: 'schedule.resume',
          onPress: () => edit.resume(schedule),
        }
      : {
          labelKey: 'schedule.pauseAction',
          onPress: () => setField('pause'),
        };
  const doses = previewOccurrences(
    schedule,
    schedule.timesOfDay,
    schedule,
    now,
  );

  return (
    <>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      <ThemedView style={styles.container}>
        <ScrollView contentContainerStyle={styles.content}>
          <ScheduleProductCard
            product={product}
            onPress={() => router.push(`/products/${product.id}`)}
          />

          {statusMessageKey ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t(statusMessageKey)}
            </ThemedText>
          ) : null}
          {schedule.endDate ? (
            <CourseProgressBar
              progress={progress}
              label={describeCourse(progress, schedule.endDate, t, formatDate)}
            />
          ) : null}
          {stock ? (
            <ThemedText
              type="small"
              themeColor={stock.warning ? 'overdueText' : 'textSecondary'}
            >
              {stock.message}
            </ThemedText>
          ) : null}

          <View style={styles.section}>
            <ThemedText type="label">{t('schedule.fieldsHint')}</ThemedText>
            <FieldRow
              label={t('schedule.intervalDays')}
              value={describeDays(schedule, t, firstWeekday)}
              onPress={() => setField('rhythm')}
            />
            <FieldRow
              label={t('schedule.timesOfDay')}
              value={formatTimes(schedule.timesOfDay)}
              onPress={() => setField('times')}
            />
            <FieldRow
              label={t('schedule.quantity')}
              value={describeAmount(
                schedule.quantity,
                schedule.steps,
                product.unit,
                t,
              )}
              onPress={() => setField('quantity')}
            />
            <FieldRow
              label={t('schedule.periodLabel')}
              value={
                describePeriod(schedule, t, formatDate) ||
                t('schedule.periodOpen')
              }
              onPress={() => setField('period')}
            />
          </View>

          {productArchived ? null : (
            <View style={styles.section}>
              <ThemedText type="label">{t('schedule.preview')}</ThemedText>
              <DosePreview
                hasTimes={schedule.timesOfDay.length > 0}
                doses={doses}
              />
            </View>
          )}

          <View style={styles.actions}>
            <SecondaryButton
              label={t(stateAction.labelKey)}
              onPress={stateAction.onPress}
            />
            <DestructiveButton
              label={t('editor.delete')}
              onPress={() => setConfirmingDelete(true)}
            />
          </View>
        </ScrollView>

        <UndoSnackbar snackbar={snackbar} />

        {field ? (
          <ScheduleFieldSheet
            field={field}
            schedule={schedule}
            unit={product.unit}
            now={now}
            onSave={(change) =>
              edit.saveChange(schedule, field, change, () => setField(null))
            }
            onPause={(resumeAt) =>
              edit.pause(schedule, resumeAt, () => setField(null))
            }
            onClose={() => setField(null)}
          />
        ) : null}

        <ConfirmDialog
          visible={confirmingDelete}
          destructive
          title={t('schedule.deleteTitle')}
          message={t('schedule.deleteConfirm')}
          confirmLabel={t('editor.delete')}
          onConfirm={() => {
            setConfirmingDelete(false);
            runThenGoBack(
              () => removeSchedule(schedule.id),
              'schedule.errorDelete',
            );
          }}
          onCancel={() => setConfirmingDelete(false)}
        />
      </ThemedView>
    </>
  );
}

function scheduleStockSufficiency(
  schedule: Schedule,
  schedules: Schedule[],
  product: Product,
  now: Date,
  t: Translate,
  formatDate: (date: Date) => string,
) {
  return describeStockSufficiency(
    {
      stock: product.stock,
      unit: product.unit,
      status: reorderStatus(
        product.stock,
        schedules.filter((s) => s.productId === product.id),
        now,
      ),
      hasEndDate: schedule.endDate !== null || hasFiniteTaper(schedule),
    },
    t,
    formatDate,
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    gap: Spacing.sixteen,
    padding: Spacing.twenty,
  },
  section: {
    gap: Spacing.eight,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
});
