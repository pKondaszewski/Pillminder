import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { useNow } from '@/commons/ui/use-now';
import { startOfDay } from '@/config/date-utils';
import {
  buildRecentDays,
  getProductDosesBetweenQuery,
  type RecentDays,
  recentDaysRange,
} from '@/doses/dose-service';

export function useRecentDays(productId: string): RecentDays {
  const now = useNow();
  const today = startOfDay(now).getTime();
  const { from, to } = recentDaysRange(now);
  const { data } = useLiveQuery(
    getProductDosesBetweenQuery(productId, from, to),
    [productId, today],
  );

  return buildRecentDays(data, now);
}
