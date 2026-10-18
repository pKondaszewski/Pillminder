import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { categoryLabel } from '@/products/category';
import type { ProductListFilters } from '@/products/product-list';
import { Spacing } from '@/ui/commons/constants/theme';
import { Chip } from '@/ui/components/commons/chip';
import { SearchField } from '@/ui/components/commons/search-field';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  filters: ProductListFilters;
  categories: string[];
  onChange: (filters: ProductListFilters) => void;
};

export function ProductListFilterBar({ filters, categories, onChange }: Props) {
  const { t } = useTranslation();

  const statusOptions = [
    { label: t('products.all'), status: null },
    { label: t('products.filterActive'), status: 'active' },
    { label: t('products.filterArchived'), status: 'archived' },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <SearchField
        value={filters.query}
        onChangeText={(query) => onChange({ ...filters, query })}
        label={t('products.search')}
      />
      <ThemedView
        style={styles.row}
        accessibilityLabel={t('products.filterStatus')}
      >
        {statusOptions.map(({ label, status }) => (
          <Chip
            key={label}
            label={label}
            selected={filters.status === status}
            onPress={() => onChange({ ...filters, status })}
          />
        ))}
      </ThemedView>
      {categories.length > 1 ? (
        <ThemedView
          style={styles.row}
          accessibilityLabel={t('products.filterCategory')}
        >
          <Chip
            label={t('products.all')}
            selected={filters.category === null}
            onPress={() => onChange({ ...filters, category: null })}
          />
          {categories.map((category) => (
            <Chip
              key={category}
              label={categoryLabel(category, t)}
              selected={filters.category === category}
              onPress={() => onChange({ ...filters, category })}
            />
          ))}
        </ThemedView>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.eight,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
