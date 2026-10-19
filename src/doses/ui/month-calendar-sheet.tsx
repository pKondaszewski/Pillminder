import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, View } from 'react-native';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { SecondaryButton } from '@/commons/ui/button';
import { Chip } from '@/commons/ui/chip';
import { Radius, Spacing, type ThemeColor } from '@/commons/ui/constants/theme';
import { type DayCellState, MonthGrid } from '@/commons/ui/month-grid';
import { MonthHeader, monthName } from '@/commons/ui/month-header';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { isoDay } from '@/config/date-utils';
import {
  type DayStatus,
  dayStatus,
  monthSummary,
  monthSummaryText,
  type TodayDose,
} from '@/doses/dose-service';

const MARKER_COLORS: Partial<Record<DayStatus, ThemeColor>> = {
  allTaken: 'taken',
  skipped: 'skipped',
  missed: 'overdue',
};

type FilterProduct = { id: string; name: string };

type Props = {
  visible: boolean;
  month: Date;
  days: Date[];
  weekdayKeys: string[];
  doses: TodayDose[];
  selectedDay: Date;
  lastDay: Date;
  now: Date;
  products: FilterProduct[];
  filterProduct: FilterProduct | null;
  onClose: () => void;
  onChangeMonth: (offset: number) => void;
  onSelectDay: (day: Date) => void;
  onFilterProduct: (productId: string | null) => void;
  onBackToToday: () => void;
  onBackToProduct: (() => void) | null;
};

export function MonthCalendarSheet({
  visible,
  month,
  days,
  weekdayKeys,
  doses,
  selectedDay,
  lastDay,
  now,
  products,
  filterProduct,
  onClose,
  onChangeMonth,
  onSelectDay,
  onFilterProduct,
  onBackToToday,
  onBackToProduct,
}: Props) {
  const { t } = useTranslation();
  const [choosingProduct, setChoosingProduct] = useState(false);
  const currentMonthName = monthName(month, t);

  const cellState = (day: Date): DayCellState => {
    const status = dayStatus(day, doses, now);
    const selected = isoDay(day) === isoDay(selectedDay);
    const statusLabel =
      status === 'none'
        ? t('calendar.emptyDay')
        : t(`calendar.status.${status}`);
    return {
      selected,
      fill: selected ? 'surface' : 'background',
      disabled: isoDay(day) > isoDay(lastDay),
      markerColor: MARKER_COLORS[status],
      accessibilityLabel: `${day.getDate()}, ${statusLabel}`,
    };
  };

  const chooseProduct = (productId: string | null) => {
    onFilterProduct(productId);
    setChoosingProduct(false);
  };

  return (
    <BottomSheet
      visible={visible}
      title={t('calendar.title')}
      onClose={onClose}
    >
      {choosingProduct ? (
        <ProductChoices
          products={products}
          selectedId={filterProduct?.id ?? null}
          onChoose={chooseProduct}
        />
      ) : (
        <>
          <MonthHeader month={month} onChangeMonth={onChangeMonth} />
          <MonthGrid
            days={days}
            month={month}
            weekdayKeys={weekdayKeys}
            now={now}
            cellState={cellState}
            onSelectDay={onSelectDay}
          />
          <View style={styles.filter}>
            <Chip
              label={
                filterProduct
                  ? `${filterProduct.name} ×`
                  : t('calendar.allProducts')
              }
              selected={filterProduct !== null}
              onPress={() =>
                filterProduct ? onFilterProduct(null) : setChoosingProduct(true)
              }
            />
          </View>
          <ThemedView type="surface" style={styles.summary}>
            <ThemedText type="small">
              {monthSummaryText(
                monthSummary(doses, month, now),
                currentMonthName,
                t,
              )}
            </ThemedText>
          </ThemedView>
          <View style={styles.actions}>
            {onBackToProduct ? (
              <SecondaryButton
                label={t('calendar.backToProduct')}
                onPress={onBackToProduct}
              />
            ) : null}
            <SecondaryButton
              label={t('calendar.backToToday')}
              onPress={onBackToToday}
            />
          </View>
        </>
      )}
    </BottomSheet>
  );
}

function ProductChoices({
  products,
  selectedId,
  onChoose,
}: {
  products: FilterProduct[];
  selectedId: string | null;
  onChoose: (productId: string | null) => void;
}) {
  const { t } = useTranslation();

  return (
    <View style={styles.choices}>
      <Chip
        label={t('calendar.allProducts')}
        selected={selectedId === null}
        onPress={() => onChoose(null)}
      />
      {products.map(({ id, name }) => (
        <Chip
          key={id}
          label={name}
          selected={id === selectedId}
          onPress={() => onChoose(id)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  filter: {
    flexDirection: 'row',
  },
  summary: {
    padding: Spacing.fourteen,
    borderRadius: Radius.card,
  },
  actions: {
    flexDirection: 'row',
  },
  choices: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
