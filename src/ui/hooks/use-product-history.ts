import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { getProductHistoryQuery, toHistoryEntry } from '@/doses/dose-service';

export function useProductHistory(productId: string) {
  const { data } = useLiveQuery(getProductHistoryQuery(productId));
  return data.map(toHistoryEntry);
}
