import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { SecondaryButton } from '@/commons/ui/button';
import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { FieldRow } from '@/commons/ui/field-row';
import { Stepper } from '@/commons/ui/stepper';
import { StockBar } from '@/commons/ui/stock-bar';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatDate } from '@/commons/ui/use-format-date';
import { useTheme } from '@/commons/ui/use-theme';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import type { Product } from '@/products/product-service';
import {
  stockAmountText,
  stockSummary,
  supplyHint,
  wholeDaysLeft,
} from '@/products/product-text';

type Props = {
  product: Product;
  reorder?: ReorderStatus;
  now: Date;
  onDecrease: () => void;
  onIncrease: () => void;
  onAddPack: () => void;
  onEditStock: () => void;
  onOrder: () => void;
};

export function StockCard({
  product,
  reorder,
  now,
  onDecrease,
  onIncrease,
  onAddPack,
  onEditStock,
  onOrder,
}: Props) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const theme = useTheme();
  const { stock, unit, packSize, storeLink } = product;
  const summary = stockSummary(product, reorder, t);
  const wholeDays =
    summary.kind === 'bar' ? wholeDaysLeft(summary.daysLeft) : null;
  const hint = reorder ? supplyHint(reorder, now, t, formatDate) : null;

  return (
    <ThemedView style={styles.container}>
      <ThemedView
        style={[
          styles.card,
          { backgroundColor: theme.background, borderColor: theme.border },
        ]}
      >
        {stock === null ? (
          <>
            <ThemedText type="headline">{summary.label}</ThemedText>
            <ThemedView style={styles.row}>
              <SecondaryButton
                label={t('products.detail.setStock')}
                onPress={onEditStock}
              />
            </ThemedView>
          </>
        ) : (
          <>
            <Pressable
              onPress={onEditStock}
              accessibilityRole="button"
              accessibilityLabel={t('products.detail.editStock')}
              style={({ pressed }) => [
                styles.summary,
                pressed && styles.pressed,
              ]}
            >
              {summary.kind === 'bar' ? (
                <>
                  <ThemedView style={styles.days}>
                    <ThemedText type="title">{wholeDays}</ThemedText>
                    <ThemedText themeColor="textSecondary">
                      {t('products.detail.stockDays', {
                        count: wholeDays,
                      })}
                    </ThemedText>
                  </ThemedView>
                  <StockBar daysLeft={summary.daysLeft} label={summary.label} />
                </>
              ) : (
                <ThemedText type="headline">{summary.label}</ThemedText>
              )}
              {hint ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {hint}
                </ThemedText>
              ) : null}
            </Pressable>
            <Stepper
              decrementLabel={t('products.detail.decreaseStock')}
              incrementLabel={t('products.detail.increaseStock')}
              onDecrement={onDecrease}
              onIncrement={onIncrease}
            >
              <ThemedText type="headline" style={styles.value}>
                {stockAmountText(stock, unit, t)}
              </ThemedText>
            </Stepper>
            {packSize !== null ? (
              <ThemedView style={styles.row}>
                <SecondaryButton
                  label={t('products.detail.addPack', {
                    amount: stockAmountText(packSize, unit, t),
                  })}
                  onPress={onAddPack}
                />
              </ThemedView>
            ) : null}
          </>
        )}
      </ThemedView>
      {storeLink ? (
        <FieldRow
          label={t('products.detail.order')}
          value={storeLink}
          onPress={onOrder}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.eight,
  },
  card: {
    gap: Spacing.sixteen,
    padding: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  summary: {
    gap: Spacing.eight,
  },
  days: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.eight,
  },
  value: {
    flex: 1,
    textAlign: 'center',
  },
  row: {
    flexDirection: 'row',
  },
  pressed: {
    opacity: 0.7,
  },
});
