import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { Product } from '@/products/product-service';
import { formatAmount, type ProductUnit } from '@/products/product-unit';
import { reorderStatus } from '@/products/reorder';
import { courseProgress } from '@/schedules/schedule-list';
import type { Translate } from '@/schedules/schedule-rhythm';
import {
  describeCourse,
  describeInterval,
  describePeriod,
  isPaused,
  previewOccurrences,
  type Schedule,
} from '@/schedules/schedule-service';
import { describeStockSufficiency } from '@/schedules/stock-sufficiency';
import { Spacing } from '@/ui/commons/constants/theme';
import {
  DestructiveButton,
  SecondaryButton,
} from '@/ui/components/commons/button';
import { ConfirmDialog } from '@/ui/components/commons/confirm-dialog';
import { FieldRow } from '@/ui/components/commons/field-row';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { UndoSnackbar } from '@/ui/components/commons/undo-snackbar';
import { CourseProgressBar } from '@/ui/components/schedules/course-progress';
import { DosePreview } from '@/ui/components/schedules/dose-preview';
import {
  type ScheduleField,
  ScheduleFieldSheet,
} from '@/ui/components/schedules/field-sheets';
import { ScheduleProductCard } from '@/ui/components/schedules/product-card';
import { useFormatDate, useFormatTime } from '@/ui/hooks/use-format-date';
import { useProducts } from '@/ui/hooks/use-products';
import { useRunWithErrorAlert } from '@/ui/hooks/use-run-with-error-alert';
import { useScheduleEditActions } from '@/ui/hooks/use-schedule-edit-actions';
import { useSchedules } from '@/ui/hooks/use-schedules';
import { useUndoSnackbar } from '@/ui/hooks/use-undo-snackbar';

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const { formatTimes } = useFormatTime();
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
    schedule.intervalDays,
    schedule.timesOfDay,
    schedule,
    now,
  );

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: t('schedule.editTitle') }}
      />
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['bottom']}>
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
                label={describeCourse(
                  progress,
                  schedule.endDate,
                  t,
                  formatDate,
                )}
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
                value={describeInterval(schedule.intervalDays, t)}
                onPress={() => setField('rhythm')}
              />
              <FieldRow
                label={t('schedule.timesOfDay')}
                value={formatTimes(schedule.timesOfDay)}
                onPress={() => setField('times')}
              />
              <FieldRow
                label={t('schedule.quantity')}
                value={describeQuantity(schedule.quantity, product.unit, t)}
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
        </SafeAreaView>

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
      hasEndDate: schedule.endDate !== null,
    },
    t,
    formatDate,
  );
}

function describeQuantity(
  quantity: number,
  unit: ProductUnit | null,
  t: Translate,
) {
  return unit ? formatAmount(quantity, unit, t) : String(quantity);
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
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
