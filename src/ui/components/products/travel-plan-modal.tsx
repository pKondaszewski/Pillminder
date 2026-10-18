import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addDays, startOfDay } from '@/config/date-utils';
import type { TravelPlanEntry } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { SecondaryButton } from '@/ui/components/commons/button';
import { DateButton } from '@/ui/components/commons/date-button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTravelPlan } from '@/ui/hooks/use-travel-plan';

const DEFAULT_TRIP_LENGTH_DAYS = 7;

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Edge = 'departure' | 'return';

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
  const [departure, setDeparture] = useState(() =>
    addDays(startOfDay(new Date()), 1),
  );
  const [returnDay, setReturnDay] = useState(() =>
    addDays(startOfDay(new Date()), DEFAULT_TRIP_LENGTH_DAYS),
  );
  const [pickerFor, setPickerFor] = useState<Edge | null>(null);
  const plan = useTravelPlan(departure, returnDay);
  const rangeInvalid = returnDay < departure;

  const onDateChange = (_event: DateTimePickerChangeEvent, date: Date) => {
    const day = startOfDay(date);
    if (pickerFor === 'departure') setDeparture(day);
    if (pickerFor === 'return') setReturnDay(day);
    setPickerFor(null);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('travel.title')}</ThemedText>
          <ThemedView style={styles.range}>
            <DateButton
              label={t('travel.departure')}
              value={departure}
              onPress={() => setPickerFor('departure')}
            />
            <DateButton
              label={t('travel.return')}
              value={returnDay}
              onPress={() => setPickerFor('return')}
            />
          </ThemedView>
          {pickerFor ? (
            <DateTimePicker
              value={pickerFor === 'departure' ? departure : returnDay}
              mode="date"
              onValueChange={onDateChange}
              onDismiss={() => setPickerFor(null)}
            />
          ) : null}
          {rangeInvalid ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('travel.invalidRange')}
            </ThemedText>
          ) : (
            <TravelResults entries={plan} />
          )}
          <ThemedView style={styles.actions}>
            <SecondaryButton label={t('editor.close')} onPress={onClose} />
          </ThemedView>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function TravelResults({ entries }: { entries: TravelPlanEntry[] }) {
  const { t } = useTranslation();
  if (entries.length === 0) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText>{t('travel.empty')}</ThemedText>
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
  const { verdict } = entry;
  const needsRefill = verdict !== null && verdict !== 'enough';
  return (
    <ThemedView type="surface" style={styles.block}>
      <ThemedText type="smallBold">{entry.title}</ThemedText>
      <ThemedText type="small">
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
  safeArea: { flex: 1, paddingHorizontal: Spacing.twentyFour },
  content: { gap: Spacing.eight, paddingVertical: Spacing.sixteen },
  range: { flexDirection: 'row', gap: Spacing.eight },
  empty: { gap: Spacing.four, paddingVertical: Spacing.sixteen },
  block: {
    padding: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
    gap: Spacing.four,
  },
  actions: { flexDirection: 'row' },
});
