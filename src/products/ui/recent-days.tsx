import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, type ViewStyle } from 'react-native';

import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatDate } from '@/commons/ui/use-format-date';
import { useTheme } from '@/commons/ui/use-theme';
import type { DayStatus, RecentDays } from '@/doses/dose-service';
import { ProductSection } from '@/products/ui/section';

const DOT_SIZE = 14;

type Props = {
  recent: RecentDays;
  onDayPress: (day: Date) => void;
  onCalendarPress: () => void;
};

export function RecentDaysSection({
  recent,
  onDayPress,
  onCalendarPress,
}: Props) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const { taken, skipped, missed } = recent.counts;

  return (
    <ProductSection title={t('products.detail.recentDays')}>
      <ThemedView style={styles.strip}>
        {recent.days.map(({ day, status }) => (
          <Pressable
            key={day.getTime()}
            onPress={() => onDayPress(day)}
            accessibilityRole="button"
            accessibilityLabel={`${formatDate(day)}: ${t(`products.detail.dayStatus.${status}`)}`}
            style={styles.day}
          >
            <DayDot status={status} />
            <ThemedText type="caption">{day.getDate()}</ThemedText>
          </Pressable>
        ))}
      </ThemedView>
      <ThemedText type="small" themeColor="textSecondary">
        {t('products.detail.recentCounts', { taken, skipped, missed })}
      </ThemedText>
      <Pressable
        onPress={onCalendarPress}
        accessibilityRole="button"
        style={({ pressed }) => pressed && styles.pressed}
      >
        <ThemedText type="smallBold" themeColor="accent">
          {t('products.detail.calendar')}
        </ThemedText>
      </Pressable>
    </ProductSection>
  );
}

function DayDot({ status }: { status: DayStatus }) {
  const theme = useTheme();
  const dotStyles: Record<DayStatus, ViewStyle> = {
    allTaken: { backgroundColor: theme.taken },
    missed: { backgroundColor: theme.overdue },
    skipped: { backgroundColor: theme.skipped },
    upcoming: { borderWidth: 1.5, borderColor: theme.planned },
    none: { backgroundColor: theme.divider },
  };

  return <ThemedView style={[styles.dot, dotStyles[status]]} />;
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  day: {
    flex: 1,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.four,
  },
  dot: {
    width: DOT_SIZE,
    height: DOT_SIZE,
    borderRadius: DOT_SIZE / 2,
  },
  pressed: {
    opacity: 0.7,
  },
});
