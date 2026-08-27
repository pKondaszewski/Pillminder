import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import type { products as productsTable } from '@/config/db/schema';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

const LOW_STOCK_COLOR = '#d97706';

type Product = typeof productsTable.$inferSelect;

type Props = {
  product: Product;
  reorder?: ReorderStatus;
  onPress: () => void;
};

export function ProductRow({ product, reorder, onPress }: Props) {
  const { t } = useTranslation();
  const isArchived = product.status === 'archived';
  const isLow = !isArchived && reorder?.isLow && reorder.daysLeft !== null;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView
        type="backgroundElement"
        style={[styles.row, isArchived && styles.archived]}
      >
        <ThemedText>{product.name}</ThemedText>
        <ThemedText type="small">
          {t(`category.${product.category}`)}
        </ThemedText>
        {isArchived && (
          <ThemedText type="small" themeColor="textSecondary">
            {t('products.archived')}
          </ThemedText>
        )}
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
  archived: {
    opacity: 0.5,
  },
  lowStock: {
    color: LOW_STOCK_COLOR,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.7,
  },
});
