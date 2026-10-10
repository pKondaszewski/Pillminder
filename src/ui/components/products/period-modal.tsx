import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { addDays, startOfDay } from '@/config/date-utils';
import { describeAdherence } from '@/products/period-report';
import type { PeriodReportEntry } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { formatDate } from '@/ui/commons/format-date';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useDoctorSummaryExport } from '@/ui/hooks/use-doctor-summary-export';
import { usePeriodReport } from '@/ui/hooks/use-period-report';
import { useProductOverview } from '@/ui/hooks/use-product-overview';

const DEFAULT_RANGE_DAYS = 30;

type Props = {
  visible: boolean;
  onClose: () => void;
};

type Edge = 'first' | 'last';

export function ProductPeriodModal({ visible, onClose }: Props) {
  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      {visible ? <PeriodContent onClose={onClose} /> : null}
    </Modal>
  );
}

function PeriodContent({ onClose }: Pick<Props, 'onClose'>) {
  const { t } = useTranslation();
  const [lastDay, setLastDay] = useState(() => startOfDay(new Date()));
  const [firstDay, setFirstDay] = useState(() =>
    addDays(startOfDay(new Date()), -(DEFAULT_RANGE_DAYS - 1)),
  );
  const [pickerFor, setPickerFor] = useState<Edge | null>(null);
  const report = usePeriodReport(firstDay, lastDay);
  const { products } = useProductOverview();
  const { busy, share } = useDoctorSummaryExport(
    products,
    report,
    firstDay,
    lastDay,
  );
  const rangeInvalid = lastDay < firstDay;
  const canShare = !rangeInvalid && report !== null && !busy;

  const onDateChange = (_event: DateTimePickerChangeEvent, date: Date) => {
    const day = startOfDay(date);
    if (pickerFor === 'first') setFirstDay(day);
    if (pickerFor === 'last') setLastDay(day);
    setPickerFor(null);
  };

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('period.title')}</ThemedText>
          <ThemedView style={styles.range}>
            <DateButton
              label={t('period.from')}
              value={firstDay}
              onPress={() => setPickerFor('first')}
            />
            <DateButton
              label={t('period.to')}
              value={lastDay}
              onPress={() => setPickerFor('last')}
            />
          </ThemedView>
          {pickerFor ? (
            <DateTimePicker
              value={pickerFor === 'first' ? firstDay : lastDay}
              mode="date"
              onValueChange={onDateChange}
              onDismiss={() => setPickerFor(null)}
            />
          ) : null}
          {rangeInvalid ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('period.invalidRange')}
            </ThemedText>
          ) : (
            <PeriodResults entries={report} />
          )}
          <Pressable
            onPress={() => void share()}
            disabled={!canShare}
            accessibilityRole="button"
            accessibilityState={{ disabled: !canShare, busy }}
            style={({ pressed }) => [
              pressed && styles.pressed,
              !canShare && styles.disabled,
            ]}
          >
            <ThemedView type="backgroundElement" style={styles.closeButton}>
              <ThemedText themeColor="accent" style={styles.closeText}>
                {t('summary.sharePdf')}
              </ThemedText>
            </ThemedView>
          </Pressable>
          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView type="backgroundElement" style={styles.closeButton}>
              <ThemedText themeColor="accent" style={styles.closeText}>
                {t('editor.close')}
              </ThemedText>
            </ThemedView>
          </Pressable>
        </ScrollView>
      </SafeAreaView>
    </ThemedView>
  );
}

function PeriodResults({ entries }: { entries: PeriodReportEntry[] | null }) {
  const { t } = useTranslation();
  if (entries === null) return null;
  if (entries.length === 0) {
    return (
      <ThemedView style={styles.empty}>
        <ThemedText>{t('period.empty')}</ThemedText>
        <ThemedText type="small" themeColor="textSecondary">
          {t('period.emptyHint')}
        </ThemedText>
      </ThemedView>
    );
  }
  return (
    <>
      {entries.map((product) => (
        <ProductBlock key={product.id} product={product} />
      ))}
    </>
  );
}

function ProductBlock({ product }: { product: PeriodReportEntry }) {
  const { t } = useTranslation();
  return (
    <ThemedView type="backgroundElement" style={styles.block}>
      <ThemedText type="smallBold">{product.title}</ThemedText>
      {product.isArchived ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('products.archived')}
        </ThemedText>
      ) : null}
      <ThemedText type="small">{describeAdherence(product, t)}</ThemedText>
    </ThemedView>
  );
}

function DateButton({
  label,
  value,
  onPress,
}: {
  label: string;
  value: Date;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.dateButton, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.dateBox}>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText themeColor="accent">{formatDate(value)}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1, paddingHorizontal: Spacing.four },
  content: { gap: Spacing.two, paddingVertical: Spacing.three },
  range: { flexDirection: 'row', gap: Spacing.two },
  dateButton: { flex: 1 },
  dateBox: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  empty: { gap: Spacing.one, paddingVertical: Spacing.three },
  block: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  closeButton: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  closeText: { fontWeight: '600' },
  pressed: { opacity: 0.7 },
  disabled: { opacity: 0.4 },
});
