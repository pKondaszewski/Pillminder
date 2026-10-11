import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  firstWeekdayOf,
  monthGridDays,
  weekdayKeysFrom,
} from '@/config/calendar-grid';
import { addDays, isoDay, startOfDay } from '@/config/date-utils';
import type { SupportedLanguage } from '@/config/i18n';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { DayDoses } from '@/ui/components/history/day-doses';
import { MonthGrid, StatusMarker } from '@/ui/components/history/month-grid';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { useCurrentDay } from '@/ui/hooks/use-current-day';
import { useDosesBetween } from '@/ui/hooks/use-doses-between';

const MONTH_KEYS = [
  'january',
  'february',
  'march',
  'april',
  'may',
  'june',
  'july',
  'august',
  'september',
  'october',
  'november',
  'december',
] as const;

const LEGEND_STATUSES = ['allTaken', 'skipped', 'missed', 'upcoming'] as const;

export default function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const today = startOfDay(new Date(useCurrentDay()));
  const now = new Date();
  const [month, setMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1),
  );
  const [selectedDay, setSelectedDay] = useState(today);

  const firstWeekday = firstWeekdayOf(i18n.language as SupportedLanguage);
  const weekdayKeys = weekdayKeysFrom(firstWeekday);
  const days = monthGridDays(month, firstWeekday);
  const doses = useDosesBetween(days[0], addDays(days[days.length - 1], 1));
  const selectedDoses = doses.filter(
    (dose) => isoDay(dose.plannedAt) === isoDay(selectedDay),
  );

  const showMonth = (offset: number) => {
    const target = new Date(month.getFullYear(), month.getMonth() + offset, 1);
    const isCurrentMonth =
      target.getFullYear() === today.getFullYear() &&
      target.getMonth() === today.getMonth();
    setMonth(target);
    setSelectedDay(isCurrentMonth ? today : target);
  };

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView contentContainerStyle={styles.content}>
            <ThemedView style={styles.header}>
              <MonthButton
                label="‹"
                accessibilityLabel={t('history.previousMonth')}
                onPress={() => showMonth(-1)}
              />
              <ThemedText type="subtitle">
                {t(`history.month.${MONTH_KEYS[month.getMonth()]}`)}{' '}
                {month.getFullYear()}
              </ThemedText>
              <MonthButton
                label="›"
                accessibilityLabel={t('history.nextMonth')}
                onPress={() => showMonth(1)}
              />
            </ThemedView>

            <MonthGrid
              days={days}
              month={month}
              doses={doses}
              selectedDay={selectedDay}
              weekdayKeys={weekdayKeys}
              now={now}
              onSelectDay={setSelectedDay}
            />

            <ThemedView style={styles.legend}>
              {LEGEND_STATUSES.map((status) => (
                <ThemedView key={status} style={styles.legendItem}>
                  <StatusMarker status={status} />
                  <ThemedText type="small" themeColor="textSecondary">
                    {t(`history.status.${status}`)}
                  </ThemedText>
                </ThemedView>
              ))}
            </ThemedView>

            <DayDoses doses={selectedDoses} now={now} />
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
    </TabSwipe>
  );
}

function MonthButton({
  label,
  accessibilityLabel,
  onPress,
}: {
  label: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      hitSlop={Spacing.two}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedText type="subtitle" themeColor="accent">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.four,
  },
  content: {
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  pressed: {
    opacity: 0.7,
  },
});
