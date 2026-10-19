import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Chip } from '@/commons/ui/chip';
import { Spacing } from '@/commons/ui/constants/theme';
import { FilterSheet } from '@/commons/ui/filter-sheet';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { categoryLabel } from '@/products/category';
import { SCHEDULE_KINDS } from '@/schedules/schedule-list';
import type { ScheduleListFilters } from '@/schedules/schedule-service';

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
