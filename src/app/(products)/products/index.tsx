import { router } from 'expo-router';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/commons/ui/constants/theme';
import { EmptyState } from '@/commons/ui/empty-state';
import {
  FLOATING_ADD_BUTTON_CLEARANCE,
  FloatingAddButton,
} from '@/commons/ui/floating-add-button';
import { TabSwipe } from '@/commons/ui/navigation/tab-swipe';
import { openStore } from '@/commons/ui/open-store';
import { type FilterToken, SearchField } from '@/commons/ui/search-field';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatTime } from '@/commons/ui/use-format-date';
import { categoryLabel } from '@/products/category';
import {
  categoryFilterIfListed,
  DEFAULT_PRODUCT_FILTERS,
  filterableCategories,
  filterProducts,
  mostUrgentLowStock,
  sortProductsByStatusThenName,
} from '@/products/product-list';
import type { Product, ProductListFilters } from '@/products/product-service';
import { rhythmSummary, stockSummary } from '@/products/product-text';
import { ProductFilterSheet } from '@/products/ui/list-filters';
import { ProductListHeader } from '@/products/ui/list-header';
import { LowStockBanner } from '@/products/ui/low-stock-banner';
import { ProductRow } from '@/products/ui/row';
import { useProducts } from '@/products/ui/use-products';
import { useReorderStatuses } from '@/products/ui/use-reorder';
import { useSchedules } from '@/schedules/ui/use-schedules';

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
