import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { Radius, Spacing, type ThemeColor } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import { splitIntoWeeks } from '@/config/calendar-grid';
import { isoDay } from '@/config/date-utils';

const MARKER_SIZE = 8;

export type DayCellState = {
  selected: boolean;
  fill: ThemeColor;
  disabled: boolean;
  markerColor?: ThemeColor;
  accessibilityLabel: string;
};

type Props = {
  days: Date[];
  month: Date;
  weekdayKeys: string[];
  now: Date;
  cellState: (day: Date) => DayCellState;
  onSelectDay: (day: Date) => void;
};

export function MonthGrid({
  days,
  month,
  weekdayKeys,
  now,
  cellState,
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
              isToday={isoDay(day) === isoDay(now)}
              state={cellState(day)}
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
  isToday,
  state: { selected, fill, disabled, markerColor, accessibilityLabel },
  onPress,
}: {
  day: Date;
  inMonth: boolean;
  isToday: boolean;
  state: DayCellState;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ selected, disabled }}
      style={[styles.cellPressable, disabled && styles.disabled]}
    >
      <ThemedView
        type={fill}
        style={[styles.cell, isToday && { borderColor: theme.accent }]}
      >
        <ThemedText
          type={isToday ? 'smallBold' : 'small'}
          themeColor={dayNumberColor(inMonth, isToday, fill)}
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

function dayNumberColor(
  inMonth: boolean,
  isToday: boolean,
  fill: ThemeColor,
): ThemeColor {
  if (fill === 'accent') return 'onAccent';
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
