import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  getTodaysDosesQuery,
  takeDose,
  toTodayDose,
  untakeDose,
} from '@/doses/dose-service';
import { productLabel } from '@/products/product-label';
import { useProducts } from '@/ui/hooks/use-products';
import { useSchedules } from '@/ui/hooks/use-schedules';

export function useTodaysDoses() {
  const { data } = useLiveQuery(getTodaysDosesQuery());
  const { products } = useProducts();

  const { schedules } = useSchedules();

  const nameById = new Map(
    products.map((p) => [p.id, productLabel(p.name, p.strength)]),
  );
  const quantityById = new Map(
    (schedules ?? []).map((s) => [s.id, s.quantity]),
  );
  const doses = data.map((dose) =>
    toTodayDose(
      dose,
      nameById.get(dose.productId) ?? null,
      quantityById.get(dose.scheduleId) ?? 1,
    ),
  );

  return { doses, takeDose, untakeDose };
}
