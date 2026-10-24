import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ConfirmDialog } from '@/commons/ui/confirm-dialog';
import { MIN_TOUCH_SIZE, Spacing } from '@/commons/ui/constants/theme';
import { EmptyState } from '@/commons/ui/empty-state';
import { ThemedView } from '@/commons/ui/themed-view';
import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import { useConfirmation } from '@/commons/ui/use-confirmation';
import { useFirstWeekday, useFormatDate } from '@/commons/ui/use-format-date';
import { useNow } from '@/commons/ui/use-now';
import { monthGridDays, weekdayKeysFrom } from '@/config/calendar-grid';
import { addDays, addMonths, isoDay, startOfDay } from '@/config/date-utils';
import {
  buildTimeline,
  type CorrectionTarget,
  dayPhases,
  groupDosesByTimeSlot,
  lastPlannedDay,
  nowPosition,
  type TodayCardState,
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
import { TodayMeadow } from '@/doses/ui/today-meadow';
import { useDayDoses } from '@/doses/ui/use-day-doses';
import { useDosesBetween } from '@/doses/ui/use-doses-between';
import { useMeadowMarks } from '@/doses/ui/use-meadow-marks';
import {
  type UndoableKind,
  useUndoableDoseAction,
} from '@/doses/ui/use-undoable-dose-action';
import { IntakeRow } from '@/intakes/ui/intake-row';
import { useIntakesBetween, useRemoveIntake } from '@/intakes/ui/use-intakes';
import { useSunCoords } from '@/location/ui/use-sun-coords';
import { useProducts } from '@/products/ui/use-products';
import {
  markSpacing,
  MEADOW_BOTTOM,
  type SceneMood,
  skyScene,
} from '@/scene/scene-service';
import { DayScene } from '@/scene/ui/day-scene';
import { useCelebration } from '@/scene/ui/use-celebration';
import { useSeason } from '@/scene/ui/use-season';

export default function HomeScreen() {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const now = useNow();
  const coords = useSunCoords();
  const season = useSeason(now);
  const { top: topInset } = useSafeAreaInsets();
  const { width } = useWindowDimensions();
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
    skipDose,
    revertDose,
    correctDoseState,
    restoreDose,
  } = useDayDoses(day);
  const {
    snackbar,
    runWithUndo,
    applyWithUndo,
    correctWithUndo,
    takeAll,
    revert,
  } = useUndoableDoseAction(
    {
      taken: { apply: takeDose, revert: revertDose },
      skipped: { apply: skipDose, revert: revertDose },
    },
    { correct: correctDoseState, restore: restoreDose },
  );
  const dayIntakes = useIntakesBetween(day, addDays(day, 1));
  const handleTake = (dose: TodayDose) => applyWithUndo('taken', dose);
  const revertConfirmation = useConfirmation<TodayDose>((dose) =>
    revert(undoableKindOf(dose), dose.id),
  );
  const removeIntake = useRemoveIntake(runWithUndo);

  const revertedDose = revertConfirmation.pending?.value;
  const revertTexts = revertedDose
    ? DOSE_ACTION_TEXT_KEYS[undoableKindOf(revertedDose)]
    : null;

  const firstWeekday = useFirstWeekday();
  const calendarDays = monthGridDays(calendarMonth, firstWeekday);
  const monthDoses = useDosesBetween(
    calendarDays[0],
    addDays(calendarDays[calendarDays.length - 1], 1),
  ).filter((dose) => !filterProductId || dose.productId === filterProductId);
  const monthIntakes = useIntakesBetween(
    calendarDays[0],
    addDays(calendarDays[calendarDays.length - 1], 1),
  ).filter(
    (intake) => !filterProductId || intake.productId === filterProductId,
  );

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
  const openProduct = ({ productId }: { productId: string }) =>
    router.push({ pathname: '/products/[id]', params: { id: productId } });
  const openCalendar = () => {
    setCalendarMonth(day);
    setCalendarOpen(true);
  };
  const changeMonth = (offset: number) =>
    setCalendarMonth(addMonths(calendarMonth, offset));
  const saveCorrection = (dose: TodayDose, target: CorrectionTarget) => {
    setCorrecting(null);
    return correctWithUndo(dose, target);
  };

  const isToday = mode === 'today';
  const phases = dayPhases(day, coords);
  const cardState = doses.length > 0 ? todayCardState(doses, day, now) : null;
  const mood = cardState ? moodOf(cardState.kind) : null;
  const celebrationKey = useCelebration(mood, isoDay(day));
  const scene = skyScene(now, phases, isToday);
  const night = scene.phase === 'night';
  const timeline = buildTimeline(doses, now, markSpacing(width));
  const meadowMarks = useMeadowMarks(timeline);

  return (
    <ThemedView style={styles.container}>
      <View style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={[
            styles.content,
            { paddingTop: topInset + CONTENT_PADDING_TOP },
          ]}
        >
          <DayScene
            scene={scene}
            mood={mood ?? 'calm'}
            season={season}
            marks={meadowMarks}
            nowPosition={isToday ? nowPosition(now) : null}
            celebrationKey={celebrationKey}
            replayKey={isoDay(day)}
            topInset={topInset}
          />
          <DayPager
            label={formatDate(day, true)}
            canGoNext={isoDay(day) < isoDay(lastDay)}
            showBackToToday={mode !== 'today'}
            night={night}
            onPrevious={() => selectDay(addDays(day, -1))}
            onNext={() => selectDay(addDays(day, 1))}
            onOpenCalendar={openCalendar}
            onBackToToday={() => selectDay(today)}
          />
          <View pointerEvents="none" style={styles.sceneWindow} />
          <TodayMeadow
            key={isoDay(day)}
            timeline={timeline}
            marks={meadowMarks}
            canTake={isToday}
            topInset={topInset}
            night={night}
            onTake={handleTake}
          />
          {loaded && products.length === 0 ? (
            <EmptyState
              icon="medication"
              title={t('home.emptyProducts.title')}
              message={t('home.emptyProducts.message')}
              actionLabel={t('home.emptyProducts.action')}
              onAction={() =>
                router.push({
                  pathname: '/products/new',
                  params: { forSchedule: '1' },
                })
              }
            />
          ) : null}
          {products.length > 0 &&
          doses.length === 0 &&
          dayIntakes.length === 0 ? (
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
          {cardState ? (
            <TodayCard
              key={isoDay(day)}
              state={cardState}
              onTake={handleTake}
              onTakeOverdue={takeAll}
            />
          ) : null}
          {groupDosesByTimeSlot(doses, dayIntakes).map((group) => (
            <TimeSlotSection
              key={`${isoDay(day)}-${group.slot}`}
              group={group}
              renderDose={(dose) => (
                <DoseRow
                  dose={dose}
                  mode={mode}
                  now={now}
                  onTake={handleTake}
                  onSkip={(skipped) => applyWithUndo('skipped', skipped)}
                  onRevert={revertConfirmation.request}
                  onCorrect={setCorrecting}
                  onOpenProduct={openProduct}
                />
              )}
              renderIntake={(intake) => (
                <IntakeRow
                  intake={intake}
                  mode={mode}
                  onRevert={removeIntake}
                  onOpenProduct={openProduct}
                />
              )}
            />
          ))}
        </ScrollView>
      </View>
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
      <MonthCalendarSheet
        visible={calendarOpen}
        month={calendarMonth}
        days={calendarDays}
        weekdayKeys={weekdayKeysFrom(firstWeekday)}
        doses={monthDoses}
        intakes={monthIntakes}
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

function moodOf(kind: TodayCardState['kind']): SceneMood {
  if (kind === 'overdue' || kind === 'done') return kind;
  return 'calm';
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

const CONTENT_GAP = Spacing.sixteen;
const CONTENT_PADDING_TOP = Spacing.sixteen;
const PAGER_HEIGHT = MIN_TOUCH_SIZE;
const CARD_CLEARANCE = Spacing.eight;
const SCENE_WINDOW_HEIGHT =
  MEADOW_BOTTOM +
  CARD_CLEARANCE -
  (CONTENT_PADDING_TOP + PAGER_HEIGHT + 2 * CONTENT_GAP);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  sceneWindow: {
    height: SCENE_WINDOW_HEIGHT,
  },
  content: {
    gap: CONTENT_GAP,
    paddingHorizontal: Spacing.twenty,
    paddingVertical: Spacing.sixteen,
  },
});
