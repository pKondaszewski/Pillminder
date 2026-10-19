import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { MIN_TOUCH_SIZE, Spacing } from '@/commons/ui/constants/theme';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { SearchField } from '@/commons/ui/search-field';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import { productLabel } from '@/products/product-label';
import {
  filterProductsByName,
  PRODUCT_SEARCH_THRESHOLD,
} from '@/products/product-list';
import type { Product } from '@/products/product-service';

type Props = {
  products: Product[];
  selectedProductId: string;
  error?: string;
  onSelect: (productId: string) => void;
  onNewProduct: () => void;
};

export function ProductPicker({
  products,
  selectedProductId,
  error,
  onSelect,
  onNewProduct,
}: Props) {
  const { t } = useTranslation();
  const [query, setQuery] = useState('');
  const visibleProducts = filterProductsByName(products, query);

  return (
    <ThemedView style={styles.container}>
      {products.length > PRODUCT_SEARCH_THRESHOLD ? (
        <SearchField
          value={query}
          onChangeText={setQuery}
          label={t('schedule.searchProduct')}
        />
      ) : null}
      {visibleProducts.map((product) => (
        <ProductRadioRow
          key={product.id}
          product={product}
          selected={product.id === selectedProductId}
          onPress={() => onSelect(product.id)}
        />
      ))}
      {visibleProducts.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {products.length === 0
            ? t('schedule.noProducts')
            : t('schedule.noMatchingProducts')}
        </ThemedText>
      ) : null}
      <Pressable
        onPress={onNewProduct}
        accessibilityRole="button"
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}
      >
        <ThemedText type="smallBold" themeColor="accent">
          {t('schedule.newProduct')}
        </ThemedText>
      </Pressable>
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
    </ThemedView>
  );
}

function ProductRadioRow({
  product,
  selected,
  onPress,
}: {
  product: Product;
  selected: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View
        style={[
          styles.radio,
          { borderColor: selected ? theme.accent : theme.borderStrong },
        ]}
      >
        {selected ? (
          <View style={[styles.radioDot, { backgroundColor: theme.accent }]} />
        ) : null}
      </View>
      <ProductAvatar
        category={product.category}
        imageFileName={product.profileImageFileName}
        size={36}
      />
      <ThemedText numberOfLines={1} style={styles.name}>
        {productLabel(product.name, product.strength)}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.four,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.twelve,
    minHeight: MIN_TOUCH_SIZE,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  name: {
    flex: 1,
  },
  pressed: {
    opacity: 0.7,
  },
});
