import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useDateLocale } from '@/commons/ui/use-format-date';
import { useTheme } from '@/commons/ui/use-theme';
import {
  addDays,
  type DateRange,
  daysBetween,
  isoDay,
  startOfDay,
} from '@/config/date-utils';
import { formatDateRange } from '@/config/format-date';
import type { TravelPlanEntry } from '@/products/product-service';
import { TripRangeSheet } from '@/products/ui/trip-range-sheet';
import { TripScene } from '@/products/ui/trip-scene';
import { useTravelPlan } from '@/products/ui/use-travel-plan';

const DEFAULT_TRIP_LENGTH_DAYS = 7;

type TravelPlanProps = {
  onOpenProduct: (id: string) => void;
};

export function TravelPlan({ onOpenProduct }: TravelPlanProps) {
  const { t } = useTranslation();
  const dateLocale = useDateLocale();
  const [range, setRange] = useState<DateRange>(() => ({
    from: addDays(startOfDay(new Date()), 1),
    to: addDays(startOfDay(new Date()), DEFAULT_TRIP_LENGTH_DAYS),
  }));
  const [pickingRange, setPickingRange] = useState(false);
  const plan = useTravelPlan(range.from, range.to);

  const saveRange = (picked: DateRange) => {
    setRange(picked);
    setPickingRange(false);
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <TripScene
          entries={plan}
          tripDays={daysBetween(range.from, range.to) + 1}
          replayKey={`${isoDay(range.from)}|${isoDay(range.to)}`}
        />
        <View style={styles.body}>
          <Pressable
            onPress={() => setPickingRange(true)}
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="surface" style={styles.rangeField}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('travel.dates')}
              </ThemedText>
              <ThemedText themeColor="accent">
                {formatDateRange(range.from, range.to, dateLocale, new Date())}
              </ThemedText>
            </ThemedView>
          </Pressable>
          <TravelResults entries={plan} onOpenProduct={onOpenProduct} />
        </View>
      </ScrollView>
      <TripRangeSheet
        visible={pickingRange}
        range={range}
        onClose={() => setPickingRange(false)}
        onSave={saveRange}
      />
    </ThemedView>
  );
}

function TravelResults({
  entries,
  onOpenProduct,
}: {
  entries: TravelPlanEntry[];
  onOpenProduct: (id: string) => void;
}) {
  const { t } = useTranslation();
  if (entries.length === 0) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText type="headline">{t('travel.empty')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('travel.emptyHint')}
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <>
      {entries.map((entry) => (
        <ProductBlock
          key={entry.id}
          entry={entry}
          onPress={() => onOpenProduct(entry.id)}
        />
      ))}
    </>
  );
}

function ProductBlock({
  entry,
  onPress,
}: {
  entry: TravelPlanEntry;
  onPress: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { verdict } = entry;
  const needsRefill = verdict !== null && verdict !== 'enough';
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView style={[styles.block, { borderColor: theme.border }]}>
        <ProductAvatar
          category={entry.category}
          size={40}
          imageFileName={entry.profileImageFileName}
        />
        <View style={styles.texts}>
          <ThemedText type="headline">{entry.title}</ThemedText>
          <ThemedText type="small" themeColor="textSecondary">
            {entry.pack}
          </ThemedText>
          {verdict ? (
            <ThemedText
              type={needsRefill ? 'smallBold' : 'small'}
              themeColor={needsRefill ? 'overdueText' : 'textSecondary'}
            >
              {t(`travel.${verdict}`)}
            </ThemedText>
          ) : null}
        </View>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  content: { paddingBottom: Spacing.twenty },
  body: {
    gap: Spacing.twelve,
    paddingHorizontal: Spacing.twenty,
  },
  rangeField: {
    padding: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
    gap: Spacing.four,
  },
  pressed: { opacity: 0.7 },
  texts: { flex: 1, gap: Spacing.four },
  empty: { gap: Spacing.four, paddingVertical: Spacing.sixteen },
  block: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    padding: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
});
