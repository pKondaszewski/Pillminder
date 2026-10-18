import { router } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, SectionList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { categoryLabel } from '@/products/category';
import {
  groupSchedules,
  listedScheduleCategories,
  type ScheduleListFilters,
} from '@/schedules/schedule-list';
import { MIN_TOUCH_SIZE, Spacing } from '@/ui/commons/constants/theme';
import { EmptyState } from '@/ui/components/commons/empty-state';
import {
  type FilterToken,
  SearchField,
} from '@/ui/components/commons/search-field';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { ScheduleListFilterSheet } from '@/ui/components/schedules/list-filter-sheet';
import { ScheduleRow } from '@/ui/components/schedules/row';
import { useProducts } from '@/ui/hooks/use-products';
import { useRunThenCloseEditor } from '@/ui/hooks/use-run-then-close-editor';
import { useScheduleList } from '@/ui/hooks/use-schedule-list';
import { useSchedules } from '@/ui/hooks/use-schedules';

const NO_FILTERS: ScheduleListFilters = {
  query: '',
  kind: null,
  category: null,
};

export default function ScheduleListScreen() {
  const { t, i18n } = useTranslation();
  const { products } = useProducts();
  const { items, loaded } = useScheduleList();
  const { resumeSchedule } = useSchedules();
  const [filters, setFilters] = useState(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const runResume = useRunThenCloseEditor(() => undefined);

  const now = new Date();
  const categories = listedScheduleCategories(items);
  const groups = groupSchedules(items, filters, now, i18n.language);
  const resultCount = groups.reduce(
    (sum, group) => sum + group.items.length,
    0,
  );
  const tokens = filterTokens(filters, setFilters, t);

  const header = (
    <>
      <ThemedView style={styles.titleRow}>
        <ThemedText type="title">{t('tabs.plan')}</ThemedText>
        <Pressable
          onPress={() => router.push('/schedules/new')}
          accessibilityRole="button"
          style={({ pressed }) => [styles.add, pressed && styles.pressed]}
        >
          <ThemedText type="smallBold" themeColor="accent">
            {t('schedule.addShort')}
          </ThemedText>
        </Pressable>
      </ThemedView>
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
    </>
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
                  runResume(
                    () => resumeSchedule(item.id),
                    'schedule.errorResume',
                  )
                }
              />
            )}
          />
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
    paddingVertical: Spacing.sixteen,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.eight,
  },
  add: {
    minHeight: MIN_TOUCH_SIZE,
    justifyContent: 'center',
    paddingHorizontal: Spacing.eight,
  },
  sectionLabel: {
    marginTop: Spacing.eight,
  },
  pressed: {
    opacity: 0.7,
  },
});
