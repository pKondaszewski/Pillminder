import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { categoryLabel } from '@/products/category';
import {
  SCHEDULE_KINDS,
  type ScheduleListFilters,
} from '@/schedules/schedule-list';
import { Spacing } from '@/ui/commons/constants/theme';
import { Chip } from '@/ui/components/commons/chip';
import { FilterSheet } from '@/ui/components/commons/filter-sheet';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  visible: boolean;
  filters: ScheduleListFilters;
  categories: string[];
  resultCount: number;
  onChange: (filters: ScheduleListFilters) => void;
  onClose: () => void;
};

export function ScheduleListFilterSheet({
  visible,
  filters,
  categories,
  resultCount,
  onChange,
  onClose,
}: Props) {
  const { t } = useTranslation();

  return (
    <FilterSheet
      visible={visible}
      title={t('schedule.filtersTitle')}
      applyLabel={t('schedule.showResults', { count: resultCount })}
      onClear={() => onChange({ ...filters, kind: null, category: null })}
      onClose={onClose}
    >
      <ThemedText type="label">{t('schedule.filterKind')}</ThemedText>
      <ThemedView style={styles.chips}>
        {SCHEDULE_KINDS.map((kind) => (
          <Chip
            key={kind}
            label={t(`schedule.kind.${kind}`)}
            selected={filters.kind === kind}
            onPress={() =>
              onChange({
                ...filters,
                kind: filters.kind === kind ? null : kind,
              })
            }
          />
        ))}
      </ThemedView>
      {categories.length > 1 ? (
        <>
          <ThemedText type="label">{t('schedule.filterCategory')}</ThemedText>
          <ThemedView style={styles.chips}>
            {categories.map((category) => (
              <Chip
                key={category}
                label={categoryLabel(category, t)}
                selected={filters.category === category}
                onPress={() =>
                  onChange({
                    ...filters,
                    category: filters.category === category ? null : category,
                  })
                }
              />
            ))}
          </ThemedView>
        </>
      ) : null}
    </FilterSheet>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
