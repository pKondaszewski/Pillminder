import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { categoryLabel } from '@/products/category';
import { DEFAULT_PRODUCT_FILTERS } from '@/products/product-list';
import type {
  ProductListFilters,
  ProductStatusFilter,
} from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { Chip } from '@/ui/components/commons/chip';
import { FilterSheet } from '@/ui/components/commons/filter-sheet';
import { SegmentedControl } from '@/ui/components/commons/segmented-control';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  visible: boolean;
  filters: ProductListFilters;
  categories: string[];
  resultCount: number;
  onChange: (filters: ProductListFilters) => void;
  onClose: () => void;
};

export function ProductFilterSheet({
  visible,
  filters,
  categories,
  resultCount,
  onChange,
  onClose,
}: Props) {
  const { t } = useTranslation();
  const statusOptions: { value: ProductStatusFilter; label: string }[] = [
    { value: 'active', label: t('products.filterActive') },
    { value: 'archived', label: t('products.filterArchived') },
    { value: 'all', label: t('products.all') },
  ];

  return (
    <FilterSheet
      visible={visible}
      title={t('products.filters')}
      applyLabel={t('products.showResults', { count: resultCount })}
      onClear={() =>
        onChange({ ...DEFAULT_PRODUCT_FILTERS, query: filters.query })
      }
      onClose={onClose}
    >
      <ThemedView style={styles.group}>
        <ThemedText type="label">{t('products.filterCategory')}</ThemedText>
        <ThemedView style={styles.chips}>
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
      </ThemedView>
      <ThemedView style={styles.group}>
        <ThemedText type="label">{t('products.filterStatus')}</ThemedText>
        <SegmentedControl
          options={statusOptions}
          selected={filters.status}
          onSelect={(status) => onChange({ ...filters, status })}
        />
      </ThemedView>
    </FilterSheet>
  );
}

const styles = StyleSheet.create({
  group: {
    gap: Spacing.eight,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
