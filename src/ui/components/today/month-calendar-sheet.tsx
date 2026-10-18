import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import {
  monthSummary,
  monthSummaryText,
  type TodayDose,
} from '@/doses/dose-service';
import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import { SecondaryButton } from '@/ui/components/commons/button';
import { Chip } from '@/ui/components/commons/chip';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { MonthGrid } from '@/ui/components/today/month-grid';

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
  const monthName = t(`calendar.month.${MONTH_KEYS[month.getMonth()]}`);

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
          <View style={styles.monthHeader}>
            <MonthButton
              symbol="‹"
              accessibilityLabel={t('calendar.previousMonth')}
              onPress={() => onChangeMonth(-1)}
            />
            <ThemedText type="headline">
              {`${monthName} ${month.getFullYear()}`}
            </ThemedText>
            <MonthButton
              symbol="›"
              accessibilityLabel={t('calendar.nextMonth')}
              onPress={() => onChangeMonth(1)}
            />
          </View>
          <MonthGrid
            days={days}
            month={month}
            doses={doses}
            selectedDay={selectedDay}
            lastDay={lastDay}
            weekdayKeys={weekdayKeys}
            now={now}
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
              {monthSummaryText(monthSummary(doses, month, now), monthName, t)}
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

function MonthButton({
  symbol,
  accessibilityLabel,
  onPress,
}: {
  symbol: string;
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [styles.monthButton, pressed && styles.pressed]}
    >
      <ThemedText type="subtitle" themeColor="accent">
        {symbol}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  monthHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  monthButton: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  pressed: {
    opacity: 0.7,
  },
});
