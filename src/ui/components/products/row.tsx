import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { categoryLabel } from '@/products/category';
import { productLabel } from '@/products/product-label';
import type { Product, StockSummary } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ProductAvatar } from '@/ui/components/commons/product-avatar';
import { StockBar } from '@/ui/components/commons/stock-bar';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  product: Product;
  rhythm: string;
  stock: StockSummary;
  onPress: () => void;
};

export function ProductRow({ product, rhythm, stock, onPress }: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const archived = product.status === 'archived';
  const detail = archived ? t('products.archived') : rhythm;

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.divider },
        pressed && styles.pressed,
      ]}
    >
      <ProductAvatar
        category={product.category}
        size={40}
        dimmed={archived}
        imageFileName={product.profileImageFileName}
      />
      <ThemedView style={styles.texts}>
        <ThemedText numberOfLines={1}>
          {productLabel(product.name, product.strength)}
        </ThemedText>
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1}>
          {`${categoryLabel(product.category, t)} · ${detail}`}
        </ThemedText>
        {stock.kind === 'bar' ? (
          <StockBar daysLeft={stock.daysLeft} label={stock.label} />
        ) : (
          <ThemedText type="caption">{stock.label}</ThemedText>
        )}
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    paddingVertical: Spacing.twelve,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  texts: {
    flex: 1,
    gap: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
