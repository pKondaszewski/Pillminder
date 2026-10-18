import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  buildRecentDays,
  getProductDosesBetweenQuery,
  type RecentDays,
  recentDaysRange,
} from '@/doses/dose-service';

import { useCurrentDay } from './use-current-day';

export function useRecentDays(productId: string): RecentDays {
  const today = useCurrentDay();
  const { from, to } = recentDaysRange(new Date(today));
  const { data } = useLiveQuery(
    getProductDosesBetweenQuery(productId, from, to),
    [productId, today],
  );

  return buildRecentDays(data, new Date());
}
