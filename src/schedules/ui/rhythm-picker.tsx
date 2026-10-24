import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Chip } from '@/commons/ui/chip';
import { Spacing } from '@/commons/ui/constants/theme';
import { SegmentedControl } from '@/commons/ui/segmented-control';
import { Stepper } from '@/commons/ui/stepper';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFirstWeekday } from '@/commons/ui/use-format-date';
import { DAYS_IN_WEEK, weekdayKeyOf } from '@/config/calendar-grid';
import type { Rhythm } from '@/schedules/schedule-service';

type Props = {
  rhythm: Rhythm;
  onChange: (rhythm: Rhythm) => void;
};

type Mode = 'daily' | 'interval' | 'weekdays';

const MIN_INTERVAL_DAYS = 2;

export function RhythmPicker({ rhythm, onChange }: Props) {
  const { t } = useTranslation();
  const firstWeekday = useFirstWeekday();
  const { intervalDays, weekdays } = rhythm;
  const options = [
    { value: 'daily', label: t('schedule.daily') },
    { value: 'interval', label: t('schedule.everyFewDays') },
    { value: 'weekdays', label: t('schedule.onWeekdays') },
  ] as const;
  const mode = modeOf(rhythm);

  const selectMode = (value: Mode) => {
    switch (value) {
      case 'daily':
        return onChange({ intervalDays: 1, weekdays: null });
      case 'interval':
        return onChange({
          intervalDays: Math.max(intervalDays, MIN_INTERVAL_DAYS),
          weekdays: null,
        });
      case 'weekdays':
        return onChange({ intervalDays: 1, weekdays: [new Date().getDay()] });
    }
  };

  const toggleWeekday = (day: number, current: number[]) => {
    const next = current.includes(day)
      ? current.filter((selected) => selected !== day)
      : [...current, day];
    // At least one day stays selected, a schedule without any would never fire
    if (next.length > 0) onChange({ intervalDays: 1, weekdays: next });
  };

  return (
    <ThemedView style={styles.container}>
      <SegmentedControl
        options={options}
        selected={mode}
        onSelect={selectMode}
      />
      {mode === 'interval' ? (
        <Stepper
          decrementLabel={t('schedule.intervalLess')}
          incrementLabel={t('schedule.intervalMore')}
          onDecrement={() =>
            onChange({
              intervalDays: Math.max(MIN_INTERVAL_DAYS, intervalDays - 1),
              weekdays: null,
            })
          }
          onIncrement={() =>
            onChange({ intervalDays: intervalDays + 1, weekdays: null })
          }
        >
          <ThemedText style={styles.value}>
            {t('schedule.everyXDays', { days: intervalDays })}
          </ThemedText>
        </Stepper>
      ) : null}
      {weekdays ? (
        <ThemedView style={styles.weekdays}>
          {Array.from(
            { length: DAYS_IN_WEEK },
            (_, index) => (firstWeekday + index) % DAYS_IN_WEEK,
          ).map((day) => (
            <Chip
              key={day}
              label={t(`calendar.weekday.${weekdayKeyOf(day)}`)}
              selected={weekdays.includes(day)}
              onPress={() => toggleWeekday(day, weekdays)}
            />
          ))}
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

function modeOf({ intervalDays, weekdays }: Rhythm): Mode {
  if (weekdays) return 'weekdays';
  if (intervalDays === 1) return 'daily';
  return 'interval';
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.twelve,
  },
  value: {
    minWidth: 110,
    textAlign: 'center',
  },
  weekdays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
