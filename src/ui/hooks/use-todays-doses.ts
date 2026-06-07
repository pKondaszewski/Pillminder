import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  getTodaysDosesQuery,
  takeDose,
  toTodayDose,
  untakeDose,
} from '@/doses/dose-service';
import { useProducts } from '@/ui/hooks/use-products';

export function useTodaysDoses() {
  const { data } = useLiveQuery(getTodaysDosesQuery());
  const { products } = useProducts();

  const nameById = new Map(products.map((p) => [p.id, p.name]));
  const doses = data.map((dose) =>
    toTodayDose(dose, nameById.get(dose.productId) ?? null),
  );

  return { doses, takeDose, untakeDose };
}
