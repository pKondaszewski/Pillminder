import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { splitIntoWeeks } from '@/config/calendar-grid';
import { isoDay } from '@/config/date-utils';
import {
  type DayStatus,
  dayStatus,
  type TodayDose,
} from '@/doses/dose-service';
import { Spacing, type ThemeColor } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

const MARKER_SIZE = 8;

const MARKER_COLORS: Partial<Record<DayStatus, ThemeColor>> = {
  allTaken: 'success',
  skipped: 'textSecondary',
  missed: 'danger',
  upcoming: 'accent',
};

export function StatusMarker({ status }: { status: DayStatus }) {
  const theme = useTheme();
  const color = MARKER_COLORS[status];
  if (!color) return <ThemedView style={styles.marker} />;

  const hollow = status === 'upcoming';
  return (
    <ThemedView
      style={[
        styles.marker,
        { backgroundColor: hollow ? 'transparent' : theme[color] },
        hollow && { borderWidth: 1.5, borderColor: theme[color] },
      ]}
    />
  );
}

export function MonthGrid({
  days,
  month,
  doses,
  selectedDay,
  weekdayKeys,
  now,
  onSelectDay,
}: {
  days: Date[];
  month: Date;
  doses: TodayDose[];
  selectedDay: Date;
  weekdayKeys: string[];
  now: Date;
  onSelectDay: (day: Date) => void;
}) {
  const { t } = useTranslation();
  const weeks = splitIntoWeeks(days);

  return (
    <ThemedView style={styles.grid}>
      <ThemedView style={styles.week}>
        {weekdayKeys.map((key) => (
          <ThemedText
            key={key}
            type="small"
            themeColor="textSecondary"
            style={styles.weekdayLabel}
          >
            {t(`history.weekday.${key}`)}
          </ThemedText>
        ))}
      </ThemedView>
      {weeks.map((week) => (
        <ThemedView key={isoDay(week[0])} style={styles.week}>
          {week.map((day) => (
            <DayCell
              key={isoDay(day)}
              day={day}
              inMonth={day.getMonth() === month.getMonth()}
              selected={isoDay(day) === isoDay(selectedDay)}
              isToday={isoDay(day) === isoDay(now)}
              status={dayStatus(day, doses, now)}
              onPress={() => onSelectDay(day)}
            />
          ))}
        </ThemedView>
      ))}
    </ThemedView>
  );
}

function DayCell({
  day,
  inMonth,
  selected,
  isToday,
  status,
  onPress,
}: {
  day: Date;
  inMonth: boolean;
  selected: boolean;
  isToday: boolean;
  status: DayStatus;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const statusLabel =
    status === 'none' ? t('history.emptyDay') : t(`history.status.${status}`);
  const numberColor: ThemeColor = inMonth ? 'text' : 'textSecondary';

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${day.getDate()}, ${statusLabel}`}
      accessibilityState={{ selected }}
      style={styles.cellPressable}
    >
      <ThemedView
        type={selected ? 'backgroundSelected' : 'background'}
        style={styles.cell}
      >
        <ThemedText
          type={isToday ? 'smallBold' : 'small'}
          themeColor={isToday ? 'accent' : numberColor}
        >
          {day.getDate()}
        </ThemedText>
        <StatusMarker status={status} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.one,
  },
  week: {
    flexDirection: 'row',
  },
  weekdayLabel: {
    flex: 1,
    textAlign: 'center',
  },
  cellPressable: {
    flex: 1,
  },
  cell: {
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    borderRadius: Spacing.two,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
  },
});
