import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet, View } from 'react-native';

import { productLabel } from '@/products/product-label';
import {
  filterProductsByName,
  PRODUCT_SEARCH_THRESHOLD,
} from '@/products/product-list';
import type { Product } from '@/products/product-service';
import { MIN_TOUCH_SIZE, Spacing } from '@/ui/commons/constants/theme';
import { SearchField } from '@/ui/components/commons/search-field';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { ScheduleProductAvatar } from '@/ui/components/schedules/avatar';
import { useTheme } from '@/ui/hooks/use-theme';

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
      <ScheduleProductAvatar
        category={product.category}
        profileImageFileName={product.profileImageFileName}
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
