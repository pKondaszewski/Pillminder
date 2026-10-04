import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { getProductHistoryQuery, toHistoryEntries } from '@/doses/dose-service';

export function useProductHistory(productId: string) {
  const { data } = useLiveQuery(getProductHistoryQuery(productId));
  return toHistoryEntries(data);
}
