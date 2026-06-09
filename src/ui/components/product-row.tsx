import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import type { products as productsTable } from '@/config/db/schema';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/themed-text';
import { ThemedView } from '@/ui/components/themed-view';

const LOW_STOCK_COLOR = '#d97706';

type Product = typeof productsTable.$inferSelect;

type Props = {
  product: Product;
  reorder?: ReorderStatus;
  onPress: () => void;
};

export function ProductRow({ product, reorder, onPress }: Props) {
  const { t } = useTranslation();
  const isLow = reorder?.isLow && reorder.daysLeft !== null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView type="backgroundElement" style={styles.row}>
        <ThemedText>{product.name}</ThemedText>
        <ThemedText type="small">
          {t(`category.${product.category}`)}
        </ThemedText>
        {isLow && (
          <ThemedText type="small" style={styles.lowStock}>
            {t('products.lowStock')} ·{' '}
            {t('products.lowStockDays', {
              days: Math.ceil(reorder.daysLeft as number),
            })}
          </ThemedText>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  lowStock: {
    color: LOW_STOCK_COLOR,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
