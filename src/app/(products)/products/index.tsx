import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FlatList, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  categoryFilterIfListed,
  filterProducts,
  listedCategories,
  PRODUCT_SEARCH_THRESHOLD,
  type ProductListFilters,
  sortProductsByStatusThenName,
} from '@/products/product-list';
import type { Product } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { ProductListFilterBar } from '@/ui/components/products/list-filters';
import { ProductOverviewModal } from '@/ui/components/products/overview-modal';
import { ProductPeriodModal } from '@/ui/components/products/period-modal';
import { ProductRow } from '@/ui/components/products/row';
import { TravelPlanModal } from '@/ui/components/products/travel-plan-modal';
import { useProducts } from '@/ui/hooks/use-products';
import { useReorderStatuses } from '@/ui/hooks/use-reorder';

export default function ProductListScreen() {
  const { t, i18n } = useTranslation();
  const { products } = useProducts();
  const reorderStatuses = useReorderStatuses();

  const [filters, setFilters] = useState<ProductListFilters>({
    query: '',
    category: null,
    status: null,
  });
  const categories = listedCategories(products);
  const effectiveFilters = {
    ...filters,
    category: categoryFilterIfListed(filters.category, categories),
  };
  const searchable = products.length > PRODUCT_SEARCH_THRESHOLD;
  const visibleProducts = sortProductsByStatusThenName(
    searchable ? filterProducts(products, effectiveFilters) : products,
    i18n.language,
  );

  const [overviewOpen, setOverviewOpen] = useState(false);
  const [periodOpen, setPeriodOpen] = useState(false);
  const [travelOpen, setTravelOpen] = useState(false);

  const renderItem = ({ item }: { item: Product }) => (
    <ProductRow
      product={item}
      reorder={reorderStatuses[item.id]}
      onPress={() => router.push(`/products/${item.id}`)}
    />
  );

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <FlatList
            data={visibleProducts}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.list}
            renderItem={renderItem}
            keyboardShouldPersistTaps="handled"
            ListHeaderComponent={
              searchable ? (
                <ProductListFilterBar
                  filters={effectiveFilters}
                  categories={categories}
                  onChange={setFilters}
                />
              ) : null
            }
            ListEmptyComponent={
              searchable ? (
                <ThemedText type="small" themeColor="textSecondary">
                  {t('products.noMatching')}
                </ThemedText>
              ) : null
            }
            ListFooterComponent={
              <ThemedView style={styles.footer}>
                {[
                  {
                    label: `+ ${t('products.add')}`,
                    onPress: () => router.push('/products/new'),
                  },
                  {
                    label: t('overview.open'),
                    onPress: () => setOverviewOpen(true),
                  },
                  {
                    label: t('period.open'),
                    onPress: () => setPeriodOpen(true),
                  },
                  {
                    label: t('travel.open'),
                    onPress: () => setTravelOpen(true),
                  },
                ].map(({ label, onPress }) => (
                  <Pressable
                    key={label}
                    onPress={onPress}
                    accessibilityRole="button"
                    style={({ pressed }) => pressed && styles.pressed}
                  >
                    <ThemedView type="surface" style={styles.addRow}>
                      <ThemedText type="smallBold" themeColor="accent">
                        {label}
                      </ThemedText>
                    </ThemedView>
                  </Pressable>
                ))}
              </ThemedView>
            }
          />
        </SafeAreaView>

        <ProductOverviewModal
          visible={overviewOpen}
          onClose={() => setOverviewOpen(false)}
        />

        <ProductPeriodModal
          visible={periodOpen}
          onClose={() => setPeriodOpen(false)}
        />

        <TravelPlanModal
          visible={travelOpen}
          onClose={() => setTravelOpen(false)}
        />
      </ThemedView>
    </TabSwipe>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.twentyFour,
    gap: Spacing.sixteen,
  },
  list: {
    gap: Spacing.eight,
    paddingVertical: Spacing.sixteen,
  },
  footer: {
    gap: Spacing.eight,
  },
  addRow: {
    padding: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
