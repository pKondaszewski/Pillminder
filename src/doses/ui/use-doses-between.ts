import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  getDosesBetweenQuery,
  type TodayDose,
  toTodayDose,
} from '@/doses/dose-service';
import { useProducts } from '@/products/ui/use-products';
import { useSchedules } from '@/schedules/ui/use-schedules';

export function useDosesBetween(from: Date, to: Date): TodayDose[] {
  const { products } = useProducts();
  const { schedules } = useSchedules();
  // useLiveQuery re-runs only on changes of the FROM table (doses), so product
  // and schedule edits are signalled through these live lists as deps.
  const { data } = useLiveQuery(getDosesBetweenQuery(from, to), [
    from.getTime(),
    to.getTime(),
    products,
    schedules,
  ]);
  return data.map(toTodayDose);
}
