import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/commons/ui/constants/theme';
import { EmptyState } from '@/commons/ui/empty-state';
import {
  FLOATING_ADD_BUTTON_CLEARANCE,
  FloatingAddButton,
} from '@/commons/ui/floating-add-button';
import { TabSwipe } from '@/commons/ui/navigation/tab-swipe';
import { ScreenTitle } from '@/commons/ui/screen-title';
import { type FilterToken, SearchField } from '@/commons/ui/search-field';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { categoryLabel } from '@/products/category';
import { useProducts } from '@/products/ui/use-products';
import {
  groupSchedules,
  listedScheduleCategories,
} from '@/schedules/schedule-list';
import type { ScheduleListFilters } from '@/schedules/schedule-service';
import { ScheduleListFilterSheet } from '@/schedules/ui/list-filter-sheet';
import { ScheduleRow } from '@/schedules/ui/row';
import { useScheduleList } from '@/schedules/ui/use-schedule-list';
import { useSchedules } from '@/schedules/ui/use-schedules';

const NO_FILTERS: ScheduleListFilters = {
  query: '',
  kind: null,
  category: null,
};

export default function ScheduleListScreen() {
  const { t, i18n } = useTranslation();
  const { products, restoreProduct } = useProducts();
  const { items, loaded } = useScheduleList();
  const { resumeSchedule } = useSchedules();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const runWithAlert = useRunWithErrorAlert();

  const now = new Date();
  const categories = listedScheduleCategories(items);
  const groups = groupSchedules(items, filters, now, i18n.language);
  const resultCount = groups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );
  const showAddButton = items.length > 0;
  const tokens = filterTokens(filters, setFilters, t);

  const header = (
    <ThemedView style={styles.header}>
      <ScreenTitle title={t('tabs.plan')} />
      {items.length > 0 ? (
        <SearchField
          value={filters.query}
          onChangeText={(query) => setFilters({ ...filters, query })}
          label={t('schedule.search')}
          tokens={tokens}
          onFilterPress={() => setFiltersOpen(true)}
          filterLabel={t('schedule.filtersTitle')}
        />
      ) : null}
    </ThemedView>
  );

  const empty = !loaded ? null : products.length === 0 ? (
    <EmptyState
      icon="medication"
      title={t('schedule.emptyNoProductsTitle')}
      message={t('schedule.emptyNoProductsMessage')}
      actionLabel={t('schedule.addProduct')}
      onAction={() => router.push('/products/new')}
    />
  ) : items.length === 0 ? (
    <EmptyState
      icon="calendar_month"
      title={t('schedule.emptyTitle')}
      message={t('schedule.emptyMessage')}
      actionLabel={t('schedule.add')}
      onAction={() => router.push('/schedules/new')}
    />
  ) : (
    <ThemedText type="small" themeColor="textSecondary">
      {t('schedule.noMatching')}
    </ThemedText>
  );

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <SectionList
            sections={groups.map(({ kind, items: data }) => ({ kind, data }))}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            stickySectionHeadersEnabled={false}
            contentContainerStyle={styles.list}
            ListHeaderComponent={header}
            ListEmptyComponent={empty}
            renderSectionHeader={({ section }) => (
              <ThemedText type="label" style={styles.sectionLabel}>
                {t(`schedule.kind.${section.kind}`)}
              </ThemedText>
            )}
            renderItem={({ item, section }) => (
              <ScheduleRow
                item={item}
                kind={section.kind}
                now={now}
                onPress={() => router.push(`/schedules/${item.id}`)}
                onResume={() =>
                  runWithAlert(
                    () => resumeSchedule(item.id),
                    'schedule.errorResume',
                  )
                }
                onRestoreProduct={() =>
                  runWithAlert(
                    () => restoreProduct(item.productId),
                    'schedule.errorRestoreProduct',
                  )
                }
              />
            )}
          />
          {showAddButton ? (
            <FloatingAddButton
              accessibilityLabel={t('schedule.add')}
              onPress={() => router.push('/schedules/new')}
            />
          ) : null}
        </SafeAreaView>

        <ScheduleListFilterSheet
          visible={filtersOpen}
          filters={filters}
          categories={categories}
          resultCount={resultCount}
          onChange={setFilters}
          onClose={() => setFiltersOpen(false)}
        />
      </ThemedView>
    </TabSwipe>
  );
}

function filterTokens(
  filters: ScheduleListFilters,
  onChange: (filters: ScheduleListFilters) => void,
  t: ReturnType<typeof useTranslation>['t'],
): FilterToken[] {
  const kindToken = filters.kind && {
    label: t(`schedule.kind.${filters.kind}`),
    removeLabel: t('schedule.removeFilter', {
      label: t(`schedule.kind.${filters.kind}`),
    }),
    onRemove: () => onChange({ ...filters, kind: null }),
  };
  const categoryToken = filters.category && {
    label: categoryLabel(filters.category, t),
    removeLabel: t('schedule.removeFilter', {
      label: categoryLabel(filters.category, t),
    }),
    onRemove: () => onChange({ ...filters, category: null }),
  };
  return [kindToken, categoryToken].filter(
    (token): token is FilterToken => !!token,
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.twenty,
  },
  list: {
    gap: Spacing.eight,
    paddingBottom: FLOATING_ADD_BUTTON_CLEARANCE,
  },
  header: {
    gap: Spacing.eight,
  },
  sectionLabel: {
    marginTop: Spacing.eight,
  },
});
