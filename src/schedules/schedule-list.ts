import { daysBetween, startOfDay } from '@/config/date-utils';
import { categoryFilterIfListed } from '@/products/product-list';

import { isPaused } from './schedule-pause';
import type { Schedule, ScheduleListItem } from './schedule-repository';

export type ScheduleKind = 'ongoing' | 'timed' | 'paused' | 'ended';

export type ScheduleListFilters = {
  query: string;
  kind: ScheduleKind | null;
  category: string | null;
};

export type ScheduleGroup = {
  kind: ScheduleKind;
  items: ScheduleListItem[];
};

export type CourseProgress = {
  day: number;
  total: number;
};

export const SCHEDULE_KINDS: readonly ScheduleKind[] = [
  'ongoing',
  'timed',
  'paused',
  'ended',
];

const DEFAULT_KINDS: readonly ScheduleKind[] = ['ongoing', 'timed', 'paused'];

export function scheduleKind(
  { endDate, pausedAt, resumeAt, productStatus }: ScheduleListItem,
  now: Date,
): ScheduleKind {
  if (productStatus === 'archived') return 'paused';
  if (endDate && startOfDay(endDate) < startOfDay(now)) return 'ended';
  if (isPaused({ pausedAt, resumeAt }, now)) return 'paused';
  return endDate ? 'timed' : 'ongoing';
}

export function groupSchedules(
  items: ScheduleListItem[],
  filters: ScheduleListFilters,
  now: Date,
  locale: string,
): ScheduleGroup[] {
  const category = categoryFilterIfListed(
    filters.category,
    listedScheduleCategories(items),
  );
  const needle = filters.query.trim().toLowerCase();
  const kinds = filters.kind ? [filters.kind] : DEFAULT_KINDS;
  const matching = items
    .filter(
      (item) =>
        item.productName.toLowerCase().includes(needle) &&
        (category === null || item.productCategory === category),
    )
    .sort(
      (a, b) =>
        a.productName.localeCompare(b.productName, locale) ||
        a.id.localeCompare(b.id),
    );

  return kinds
    .map((kind) => ({
      kind,
      items: matching.filter((item) => scheduleKind(item, now) === kind),
    }))
    .filter((group) => group.items.length > 0);
}

export function listedScheduleCategories(items: ScheduleListItem[]): string[] {
  return [...new Set(items.map((item) => item.productCategory))];
}

export function courseProgress(
  { startDate, endDate }: Schedule,
  now: Date,
): CourseProgress | null {
  if (!startDate || !endDate) return null;
  const day = daysBetween(startOfDay(startDate), startOfDay(now)) + 1;
  if (day < 1) return null;
  const total = daysBetween(startOfDay(startDate), startOfDay(endDate)) + 1;
  return { day: Math.min(day, total), total };
}
