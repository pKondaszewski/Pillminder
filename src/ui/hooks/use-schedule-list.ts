import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { getScheduleListQuery } from '@/schedules/schedule-service';
import { useProducts } from '@/ui/hooks/use-products';

export function useScheduleList() {
  // useLiveQuery listens only to the main table (schedules), so a write to products has to re-run the join
  const { products } = useProducts();
  const { data, updatedAt } = useLiveQuery(getScheduleListQuery(), [products]);

  return { items: data, loaded: updatedAt !== undefined };
}
