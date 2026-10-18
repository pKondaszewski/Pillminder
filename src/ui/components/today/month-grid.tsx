import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { splitIntoWeeks } from '@/config/calendar-grid';
import { isoDay } from '@/config/date-utils';
import {
  type DayStatus,
  dayStatus,
  type TodayDose,
} from '@/doses/dose-service';
import { Radius, Spacing, type ThemeColor } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

const MARKER_SIZE = 8;

const MARKER_COLORS: Partial<Record<DayStatus, ThemeColor>> = {
  allTaken: 'taken',
  skipped: 'skipped',
  missed: 'overdue',
};

type Props = {
  days: Date[];
  month: Date;
  doses: TodayDose[];
  selectedDay: Date;
  lastDay: Date;
  weekdayKeys: string[];
  now: Date;
  onSelectDay: (day: Date) => void;
};

export function MonthGrid({
  days,
  month,
  doses,
  selectedDay,
  lastDay,
  weekdayKeys,
  now,
  onSelectDay,
}: Props) {
  const { t } = useTranslation();

  return (
    <View style={styles.grid}>
      <View style={styles.week}>
        {weekdayKeys.map((key) => (
          <ThemedText
            key={key}
            type="small"
            themeColor="textSecondary"
            style={styles.weekdayLabel}
          >
            {t(`calendar.weekday.${key}`)}
          </ThemedText>
        ))}
      </View>
      {splitIntoWeeks(days).map((week) => (
        <View key={isoDay(week[0])} style={styles.week}>
          {week.map((day) => (
            <DayCell
              key={isoDay(day)}
              day={day}
              inMonth={day.getMonth() === month.getMonth()}
              selected={isoDay(day) === isoDay(selectedDay)}
              isToday={isoDay(day) === isoDay(now)}
              disabled={isoDay(day) > isoDay(lastDay)}
              status={dayStatus(day, doses, now)}
              onPress={() => onSelectDay(day)}
            />
          ))}
        </View>
      ))}
    </View>
  );
}

function DayCell({
  day,
  inMonth,
  selected,
  isToday,
  disabled,
  status,
  onPress,
}: {
  day: Date;
  inMonth: boolean;
  selected: boolean;
  isToday: boolean;
  disabled: boolean;
  status: DayStatus;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const markerColor = MARKER_COLORS[status];
  const statusLabel =
    status === 'none' ? t('calendar.emptyDay') : t(`calendar.status.${status}`);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={`${day.getDate()}, ${statusLabel}`}
      accessibilityState={{ selected, disabled }}
      style={[styles.cellPressable, disabled && styles.disabled]}
    >
      <ThemedView
        type={selected ? 'surface' : 'background'}
        style={[styles.cell, isToday && { borderColor: theme.accent }]}
      >
        <ThemedText
          type={isToday ? 'smallBold' : 'small'}
          themeColor={dayNumberColor(inMonth, isToday)}
        >
          {day.getDate()}
        </ThemedText>
        <View
          style={[
            styles.marker,
            markerColor && { backgroundColor: theme[markerColor] },
          ]}
        />
      </ThemedView>
    </Pressable>
  );
}

function dayNumberColor(inMonth: boolean, isToday: boolean): ThemeColor {
  if (isToday) return 'accent';
  return inMonth ? 'text' : 'textTertiary';
}

const styles = StyleSheet.create({
  grid: {
    gap: Spacing.four,
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
    gap: Spacing.four,
    paddingVertical: Spacing.eight,
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderRadius: Radius.button,
  },
  marker: {
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
  },
  disabled: {
    opacity: 0.4,
  },
});
