import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/commons/ui/confirm-dialog';
import { Spacing } from '@/commons/ui/constants/theme';
import { EmptyState } from '@/commons/ui/empty-state';
import { ThemedView } from '@/commons/ui/themed-view';
import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import { useConfirmation } from '@/commons/ui/use-confirmation';
import { useFormatDate } from '@/commons/ui/use-format-date';
import { useNow } from '@/commons/ui/use-now';
import {
  firstWeekdayOf,
  monthGridDays,
  weekdayKeysFrom,
} from '@/config/calendar-grid';
import { addDays, addMonths, isoDay, startOfDay } from '@/config/date-utils';
import type { SupportedLanguage } from '@/config/i18n';
import {
  buildTimeline,
  type CorrectionTarget,
  dayPhases,
  daySymbol,
  groupDosesByTimeSlot,
  lastPlannedDay,
  nowPosition,
  todayCardState,
  type TodayDose,
} from '@/doses/dose-service';
import { DayPager } from '@/doses/ui/day-pager';
import { DoseCorrectionSheet } from '@/doses/ui/dose-correction-sheet';
import { DoseRow } from '@/doses/ui/dose-row';
import type { DayMode } from '@/doses/ui/dose-row-action';
import { MonthCalendarSheet } from '@/doses/ui/month-calendar-sheet';
import { TimeSlotSection } from '@/doses/ui/time-slot-section';
import { TodayCard } from '@/doses/ui/today-card';
import { useDayDoses } from '@/doses/ui/use-day-doses';
import { useDosesBetween } from '@/doses/ui/use-doses-between';
import {
  type UndoableKind,
  useUndoableDoseAction,
} from '@/doses/ui/use-undoable-dose-action';
import { useSunCoords } from '@/location/ui/use-sun-coords';
import { useProducts } from '@/products/ui/use-products';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const formatDate = useFormatDate();
  const now = useNow();
  const coords = useSunCoords();
  const today = startOfDay(now);
  const { products, loaded } = useProducts();

  const [pickedDay, setPickedDay] = useState<Date | null>(null);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [calendarMonth, setCalendarMonth] = useState(today);
  const [filterProductId, setFilterProductId] = useState<string | null>(null);
  const [correcting, setCorrecting] = useState<TodayDose | null>(null);
  const [returnProductId, setReturnProductId] = useState<string | null>(null);
  const params = useLocalSearchParams<{
    date?: string;
    calendarProductId?: string;
  }>();

  const day = pickedDay ?? today;
  const mode = dayMode(day, today);
  const {
    doses,
    takeDose,
    untakeDose,
    skipDose,
    unskipDose,
    correctDoseState,
  } = useDayDoses(day);
  const { snackbar, applyWithUndo, takeAll, revert } = useUndoableDoseAction({
    taken: { apply: takeDose, revert: untakeDose },
    skipped: { apply: skipDose, revert: unskipDose },
  });
  const revertConfirmation = useConfirmation<TodayDose>((dose) =>
    revert(undoableKindOf(dose), dose.id),
  );
  const takeOverdueConfirmation = useConfirmation<TodayDose[]>((overdue) =>
    takeAll(overdue.map(({ id }) => id)),
  );

  const revertedDose = revertConfirmation.pending?.value;
  const revertTexts = revertedDose
    ? DOSE_ACTION_TEXT_KEYS[undoableKindOf(revertedDose)]
    : null;

  const firstWeekday = firstWeekdayOf(i18n.language as SupportedLanguage);
  const calendarDays = monthGridDays(calendarMonth, firstWeekday);
  const monthDoses = useDosesBetween(
    calendarDays[0],
    addDays(calendarDays[calendarDays.length - 1], 1),
  ).filter((dose) => !filterProductId || dose.productId === filterProductId);

  const lastDay = lastPlannedDay(now);
  const filterProduct = products.find(({ id }) => id === filterProductId);

  const paramsKey = `${params.date ?? ''}|${params.calendarProductId ?? ''}`;
  const [handledParamsKey, setHandledParamsKey] = useState('|');
  if (paramsKey !== handledParamsKey) {
    setHandledParamsKey(paramsKey);
    const target = params.date ? parseIsoDay(params.date) : null;
    const clamped =
      target && isoDay(target) > isoDay(lastDay) ? lastDay : target;
    if (clamped) {
      setPickedDay(isoDay(clamped) === isoDay(today) ? null : clamped);
    }
    if (params.calendarProductId) {
      setFilterProductId(params.calendarProductId);
      setReturnProductId(params.calendarProductId);
      setCalendarMonth(clamped ?? today);
      setCalendarOpen(true);
    }
  }
  useEffect(() => {
    if (paramsKey === '|') return;
    router.setParams({ date: undefined, calendarProductId: undefined });
  }, [paramsKey]);

  const selectDay = (selected: Date) => {
    setPickedDay(isoDay(selected) === isoDay(today) ? null : selected);
    closeCalendar();
  };
  const closeCalendar = () => {
    setCalendarOpen(false);
    setReturnProductId(null);
  };
  const backToProduct = () => {
    if (!returnProductId) return;
    closeCalendar();
    router.navigate({
      pathname: '/products/[id]',
      params: { id: returnProductId },
    });
  };
  const openProduct = ({ productId }: TodayDose) =>
    router.push({ pathname: '/products/[id]', params: { id: productId } });
  const openCalendar = () => {
    setCalendarMonth(day);
    setCalendarOpen(true);
  };
  const changeMonth = (offset: number) =>
    setCalendarMonth(addMonths(calendarMonth, offset));
  const saveCorrection = async (dose: TodayDose, target: CorrectionTarget) => {
    setCorrecting(null);
    try {
      await correctDoseState(dose.id, target);
    } catch {
      Alert.alert(t('products.errorTitle'), t('history.errorCorrect'));
    }
  };

  const isToday = mode === 'today';
  const currentPosition = isToday ? nowPosition(now) : null;
  const currentSymbol = isToday ? daySymbol(now, dayPhases(day, coords)) : null;

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <ScrollView contentContainerStyle={styles.content}>
          <DayPager
            label={formatDate(day, true)}
            canGoNext={isoDay(day) < isoDay(lastDay)}
            showBackToToday={mode !== 'today'}
            onPrevious={() => selectDay(addDays(day, -1))}
            onNext={() => selectDay(addDays(day, 1))}
            onOpenCalendar={openCalendar}
            onBackToToday={() => selectDay(today)}
          />
          {loaded && products.length === 0 ? (
            <EmptyState
              icon="medication"
              title={t('home.emptyProducts.title')}
              message={t('home.emptyProducts.message')}
              actionLabel={t('home.emptyProducts.action')}
              onAction={() => router.push('/products/new')}
            />
          ) : null}
          {products.length > 0 && doses.length === 0 ? (
            <EmptyState
              icon="event_available"
              title={t(
                mode === 'today'
                  ? 'home.emptyDay.todayTitle'
                  : 'home.emptyDay.title',
              )}
              message={t('home.emptyDay.message')}
              actionLabel={t('home.emptyDay.action')}
              onAction={() => router.navigate('/schedules')}
            />
          ) : null}
          {doses.length > 0 ? (
            <>
              <TodayCard
                key={isoDay(day)}
                state={todayCardState(doses, day, now)}
                marks={buildTimeline(doses, now)}
                nowPosition={currentPosition}
                symbol={currentSymbol}
                onTake={(dose) => applyWithUndo('taken', dose)}
                onTakeOverdue={takeOverdueConfirmation.request}
              />
              {groupDosesByTimeSlot(doses).map((group) => (
                <TimeSlotSection
                  key={`${isoDay(day)}-${group.slot}`}
                  group={group}
                  renderDose={(dose) => (
                    <DoseRow
                      dose={dose}
                      mode={mode}
                      now={now}
                      onTake={(taken) => applyWithUndo('taken', taken)}
                      onSkip={(skipped) => applyWithUndo('skipped', skipped)}
                      onRevert={revertConfirmation.request}
                      onCorrect={setCorrecting}
                      onOpenProduct={openProduct}
                    />
                  )}
                />
              ))}
            </>
          ) : null}
        </ScrollView>
      </SafeAreaView>
      <UndoSnackbar snackbar={snackbar} />
      {correcting ? (
        <DoseCorrectionSheet
          key={correcting.id}
          dose={correcting}
          onClose={() => setCorrecting(null)}
          onSave={saveCorrection}
        />
      ) : null}
      <ConfirmDialog
        visible={revertConfirmation.pending !== null}
        title={revertTexts ? t(revertTexts.title) : ''}
        message={
          revertTexts
            ? t(revertTexts.message, { name: revertedDose?.productName })
            : ''
        }
        confirmLabel={t('home.undo')}
        onConfirm={revertConfirmation.confirm}
        onCancel={revertConfirmation.cancel}
      />
      <ConfirmDialog
        visible={takeOverdueConfirmation.pending !== null}
        title={t('home.bulkTakeTitle')}
        message={t('home.bulkTakeConfirm', {
          count: takeOverdueConfirmation.pending?.value.length ?? 0,
        })}
        confirmLabel={t('home.take')}
        onConfirm={takeOverdueConfirmation.confirm}
        onCancel={takeOverdueConfirmation.cancel}
      />
      <MonthCalendarSheet
        visible={calendarOpen}
        month={calendarMonth}
        days={calendarDays}
        weekdayKeys={weekdayKeysFrom(firstWeekday)}
        doses={monthDoses}
        selectedDay={day}
        lastDay={lastDay}
        now={now}
        products={products}
        filterProduct={filterProduct ?? null}
        onClose={closeCalendar}
        onChangeMonth={changeMonth}
        onSelectDay={selectDay}
        onFilterProduct={setFilterProductId}
        onBackToToday={() => selectDay(today)}
        onBackToProduct={returnProductId ? backToProduct : null}
      />
    </ThemedView>
  );
}

function parseIsoDay(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return null;
  const [, year, month, day] = match.map(Number);
  const parsed = new Date(year, month - 1, day);
  return isoDay(parsed) === value ? parsed : null;
}

function dayMode(day: Date, today: Date): DayMode {
  if (isoDay(day) < isoDay(today)) return 'past';
  return isoDay(day) > isoDay(today) ? 'future' : 'today';
}

function undoableKindOf(dose: TodayDose): UndoableKind {
  return dose.state === 'taken' ? 'taken' : 'skipped';
}

const DOSE_ACTION_TEXT_KEYS: Record<
  UndoableKind,
  { title: string; message: string }
> = {
  taken: { title: 'home.undoTitle', message: 'home.undoConfirm' },
  skipped: { title: 'home.unskipTitle', message: 'home.unskipConfirm' },
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  content: {
    gap: Spacing.sixteen,
    paddingHorizontal: Spacing.twenty,
    paddingVertical: Spacing.sixteen,
  },
});
