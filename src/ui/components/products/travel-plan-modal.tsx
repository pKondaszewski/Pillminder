import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addDays, type DateRange, startOfDay } from '@/config/date-utils';
import type { TravelPlanEntry } from '@/products/product-service';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { formatDateRange } from '@/ui/commons/format-date';
import { PrimaryButton } from '@/ui/components/commons/button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TripRangeSheet } from '@/ui/components/products/trip-range-sheet';
import { useFormatDate } from '@/ui/hooks/use-format-date';
import { useTheme } from '@/ui/hooks/use-theme';
import { useTravelPlan } from '@/ui/hooks/use-travel-plan';

const DEFAULT_TRIP_LENGTH_DAYS = 7;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function TravelPlanModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? <TravelContent onClose={onClose} /> : null}
    </Modal>
  );
}

function TravelContent({ onClose }: Pick<Props, 'onClose'>) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
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
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('travel.title')}</ThemedText>
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
                {formatDateRange(range.from, range.to, formatDate)}
              </ThemedText>
            </ThemedView>
          </Pressable>
          <TravelResults entries={plan} />
          <ThemedView style={styles.actions}>
            <PrimaryButton label={t('editor.close')} onPress={onClose} />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
      <TripRangeSheet
        visible={pickingRange}
        range={range}
        onClose={() => setPickingRange(false)}
        onSave={saveRange}
      />
    </ThemedView>
  );
}

function TravelResults({ entries }: { entries: TravelPlanEntry[] }) {
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
        <ProductBlock key={entry.id} entry={entry} />
      ))}
    </>
  );
}

function ProductBlock({ entry }: { entry: TravelPlanEntry }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { verdict } = entry;
  const needsRefill = verdict !== null && verdict !== 'enough';
  return (
    <ThemedView style={[styles.block, { borderColor: theme.border }]}>
      <ThemedText type="headline">{entry.title}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('travel.pack', { amount: entry.pack })}
      </ThemedText>
      {verdict ? (
        <ThemedText
          type={needsRefill ? 'smallBold' : 'small'}
          themeColor={needsRefill ? 'overdueText' : 'textSecondary'}
        >
          {t(`travel.${verdict}`)}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.twenty },
  content: { gap: Spacing.twelve, paddingVertical: Spacing.twenty },
  rangeField: {
    padding: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
    gap: Spacing.four,
  },
  pressed: { opacity: 0.7 },
  empty: { gap: Spacing.four, paddingVertical: Spacing.sixteen },
  block: {
    padding: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.card,
    gap: Spacing.four,
  },
  actions: { flexDirection: 'row' },
});
