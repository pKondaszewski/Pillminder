import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryLabel } from '@/products/category';
import {
  categoryFilterIfListed,
  DEFAULT_PRODUCT_FILTERS,
  filterableCategories,
  filterProducts,
  mostUrgentLowStock,
  type ProductListFilters,
  sortProductsByStatusThenName,
} from '@/products/product-list';
import type { Product } from '@/products/product-service';
import { rhythmSummary, stockSummary } from '@/products/product-text';
import { Spacing } from '@/ui/commons/constants/theme';
import { openStore } from '@/ui/commons/open-store';
import { EmptyState } from '@/ui/components/commons/empty-state';
import {
  FLOATING_ADD_BUTTON_CLEARANCE,
  FloatingAddButton,
} from '@/ui/components/commons/floating-add-button';
import {
  type FilterToken,
  SearchField,
} from '@/ui/components/commons/search-field';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { ProductFilterSheet } from '@/ui/components/products/list-filters';
import { ProductListHeader } from '@/ui/components/products/list-header';
import { LowStockBanner } from '@/ui/components/products/low-stock-banner';
import { ProductRow } from '@/ui/components/products/row';
import { useFormatTime } from '@/ui/hooks/use-format-date';
import { useProducts } from '@/ui/hooks/use-products';
import { useReorderStatuses } from '@/ui/hooks/use-reorder';
import { useSchedules } from '@/ui/hooks/use-schedules';

export default function ProductListScreen() {
  const { t, i18n } = useTranslation();
  const { formatTimes } = useFormatTime();
  const { products } = useProducts();
  const { schedules } = useSchedules();
  const reorderStatuses = useReorderStatuses();

  const [filters, setFilters] = useState(DEFAULT_PRODUCT_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const categories = filterableCategories(products);
  const effectiveFilters = {
    ...filters,
    category: categoryFilterIfListed(filters.category, categories),
  };
  const matching = filterProducts(products, effectiveFilters);
  const visibleProducts = sortProductsByStatusThenName(matching, i18n.language);
  const lowStock = mostUrgentLowStock(products, reorderStatuses);

  const openNewProduct = () => router.push('/products/new');
  const openProduct = (id: string) => router.push(`/products/${id}`);

  const renderItem = ({ item }: { item: Product }) => (
    <ProductRow
      product={item}
      rhythm={rhythmSummary(
        schedules.filter((schedule) => schedule.productId === item.id),
        t,
        formatTimes,
      )}
      stock={stockSummary(item, reorderStatuses[item.id], t)}
      onPress={() => openProduct(item.id)}
    />
  );

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ProductListHeader
            onTravelPress={() => router.push('/products/trip')}
          />
          {products.length === 0 ? (
            <EmptyState
              icon="medication"
              title={t('products.emptyTitle')}
              message={t('products.emptyMessage')}
              actionLabel={t('products.add')}
              onAction={openNewProduct}
            />
          ) : (
            <>
              <SearchField
                value={filters.query}
                onChangeText={(query) => setFilters({ ...filters, query })}
                label={t('products.search')}
                tokens={filterTokens(effectiveFilters, setFilters, t)}
                onFilterPress={() => setFiltersOpen(true)}
                filterLabel={t('products.filters')}
              />
              {lowStock ? (
                <LowStockBanner
                  productName={lowStock.product.name}
                  daysLeft={lowStock.daysLeft}
                  onPress={() => openProduct(lowStock.product.id)}
                  onOrder={() =>
                    lowStock.product.storeLink
                      ? openStore(lowStock.product.storeLink)
                      : openProduct(lowStock.product.id)
                  }
                />
              ) : null}
              <FlatList
                data={visibleProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                keyboardShouldPersistTaps="handled"
                ListEmptyComponent={
                  <ThemedText type="small" themeColor="textSecondary">
                    {t('products.noMatching')}
                  </ThemedText>
                }
              />
              <FloatingAddButton
                accessibilityLabel={t('products.add')}
                onPress={openNewProduct}
              />
            </>
          )}
        </SafeAreaView>

        <ProductFilterSheet
          visible={filtersOpen}
          filters={effectiveFilters}
          categories={categories}
          resultCount={matching.length}
          onChange={setFilters}
          onClose={() => setFiltersOpen(false)}
        />
      </ThemedView>
    </TabSwipe>
  );
}

function filterTokens(
  filters: ProductListFilters,
  onChange: (filters: ProductListFilters) => void,
  t: TFunction,
): FilterToken[] {
  const tokens: FilterToken[] = [];
  if (filters.category !== null) {
    const label = categoryLabel(filters.category, t);
    tokens.push({
      label,
      removeLabel: t('products.removeFilter', { label }),
      onRemove: () => onChange({ ...filters, category: null }),
    });
  }
  if (filters.status !== DEFAULT_PRODUCT_FILTERS.status) {
    const label =
      filters.status === 'archived'
        ? t('products.filterArchived')
        : t('products.all');
    tokens.push({
      label,
      removeLabel: t('products.removeFilter', { label }),
      onRemove: () =>
        onChange({ ...filters, status: DEFAULT_PRODUCT_FILTERS.status }),
    });
  }
  return tokens;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.twenty,
    gap: Spacing.twelve,
  },
  list: {
    paddingBottom: FLOATING_ADD_BUTTON_CLEARANCE,
  },
});
