import { router, useLocalSearchParams } from 'expo-router';
import type { TFunction } from 'i18next';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  firstWeekdayOf,
  monthGridDays,
  weekdayKeysFrom,
} from '@/config/calendar-grid';
import { addDays, isoDay, startOfDay } from '@/config/date-utils';
import type { SupportedLanguage } from '@/config/i18n';
import {
  buildTimeline,
  type CorrectionTarget,
  groupDosesByTimeSlot,
  lastPlannedDay,
  nowPosition,
  todayCardState,
  type TodayDose,
} from '@/doses/dose-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { EmptyState } from '@/ui/components/commons/empty-state';
import { Snackbar } from '@/ui/components/commons/snackbar';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { DayPager } from '@/ui/components/today/day-pager';
import { DoseCorrectionSheet } from '@/ui/components/today/dose-correction-sheet';
import { type DayMode, DoseRow } from '@/ui/components/today/dose-row';
import { MonthCalendarSheet } from '@/ui/components/today/month-calendar-sheet';
import { TimeSlotSection } from '@/ui/components/today/time-slot-section';
import { TodayCard } from '@/ui/components/today/today-card';
import { useDayDoses } from '@/ui/hooks/use-day-doses';
import { useDosesBetween } from '@/ui/hooks/use-doses-between';
import { useFormatDate } from '@/ui/hooks/use-format-date';
import { useNow } from '@/ui/hooks/use-now';
import { useProducts } from '@/ui/hooks/use-products';
import {
  type UndoableKind,
  useUndoableDoseAction,
} from '@/ui/hooks/use-undoable-dose-action';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const formatDate = useFormatDate();
  const now = useNow();
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
  const { undoable, applyWithUndo, takeAll, revert, undoLast, dismissUndo } =
    useUndoableDoseAction({
      taken: { apply: takeDose, revert: untakeDose },
      skipped: { apply: skipDose, revert: unskipDose },
    });

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
  const openCalendar = () => {
    setCalendarMonth(day);
    setCalendarOpen(true);
  };
  const changeMonth = (offset: number) =>
    setCalendarMonth(
      new Date(
        calendarMonth.getFullYear(),
        calendarMonth.getMonth() + offset,
        1,
      ),
    );
  const saveCorrection = async (dose: TodayDose, target: CorrectionTarget) => {
    setCorrecting(null);
    try {
      await correctDoseState(dose.id, target);
    } catch {
      Alert.alert(t('products.errorTitle'), t('history.errorCorrect'));
    }
  };

  return (
    <TabSwipe>
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
                  state={todayCardState(doses, day, now)}
                  marks={buildTimeline(doses, now)}
                  nowPosition={mode === 'today' ? nowPosition(now) : null}
                  onTake={(dose) => applyWithUndo('taken', dose)}
                  onTakeOverdue={(overdue) =>
                    confirmTakeOverdue(overdue, t, takeAll)
                  }
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
                        onRevert={(handled) =>
                          confirmRevert(handled, t, revert)
                        }
                        onCorrect={setCorrecting}
                      />
                    )}
                  />
                ))}
              </>
            ) : null}
          </ScrollView>
        </SafeAreaView>
        {undoable ? (
          <Snackbar
            key={undoable.id}
            message={t(DOSE_ACTION_TOAST_KEYS[undoable.kind], {
              name: undoable.name,
            })}
            actionLabel={t('home.undo')}
            onAction={undoLast}
            onDismiss={dismissUndo}
          />
        ) : null}
        {correcting ? (
          <DoseCorrectionSheet
            key={correcting.id}
            dose={correcting}
            onClose={() => setCorrecting(null)}
            onSave={saveCorrection}
          />
        ) : null}
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
    </TabSwipe>
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

function confirmRevert(
  dose: TodayDose,
  t: TFunction,
  revert: (kind: UndoableKind, id: string) => void,
) {
  const kind: UndoableKind = dose.state === 'taken' ? 'taken' : 'skipped';
  const { title, message } = DOSE_ACTION_TEXT_KEYS[kind];
  Alert.alert(t(title), t(message, { name: dose.productName }), [
    { text: t('editor.cancel'), style: 'cancel' },
    { text: t('home.undo'), onPress: () => revert(kind, dose.id) },
  ]);
}

function confirmTakeOverdue(
  overdue: TodayDose[],
  t: TFunction,
  takeAll: (ids: string[]) => void,
) {
  const count = overdue.length;
  Alert.alert(t('home.bulkTakeTitle'), t('home.bulkTakeConfirm', { count }), [
    { text: t('editor.cancel'), style: 'cancel' },
    {
      text: t('home.take'),
      onPress: () => takeAll(overdue.map(({ id }) => id)),
    },
  ]);
}

const DOSE_ACTION_TEXT_KEYS: Record<
  UndoableKind,
  { title: string; message: string }
> = {
  taken: { title: 'home.undoTitle', message: 'home.undoConfirm' },
  skipped: { title: 'home.unskipTitle', message: 'home.unskipConfirm' },
};

const DOSE_ACTION_TOAST_KEYS: Record<UndoableKind, string> = {
  taken: 'home.takenToast',
  skipped: 'home.skippedToast',
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
