import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { msUntilNextDay, startOfDay } from '@/config/date-utils';
import {
  getTodaysDosesQuery,
  skipDose,
  takeDose,
  toTodayDose,
  unskipDose,
  untakeDose,
} from '@/doses/dose-service';
import { productLabel } from '@/products/product-label';
import { useProducts } from '@/ui/hooks/use-products';
import { useSchedules } from '@/ui/hooks/use-schedules';

export function useTodaysDoses() {
  const day = useCurrentDay();
  const { data } = useLiveQuery(getTodaysDosesQuery(new Date(day)), [day]);
  const { products } = useProducts();

  const { schedules } = useSchedules();

  const nameById = new Map(
    products.map((p) => [p.id, productLabel(p.name, p.strength)]),
  );
  const quantityById = new Map(schedules.map((s) => [s.id, s.quantity]));
  const doses = data.map((dose) =>
    toTodayDose(
      dose,
      nameById.get(dose.productId) ?? null,
      quantityById.get(dose.scheduleId) ?? 1,
    ),
  );

  return { doses, takeDose, untakeDose, skipDose, unskipDose };
}

function useCurrentDay(): number {
  const [day, setDay] = useState(() => startOfDay(new Date()).getTime());

  useEffect(() => {
    const refresh = () => setDay(startOfDay(new Date()).getTime());

    let timer: ReturnType<typeof setTimeout>;
    const armTimer = () => {
      timer = setTimeout(() => {
        refresh();
        armTimer();
      }, msUntilNextDay(new Date()));
    };
    armTimer();

    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });

    return () => {
      clearTimeout(timer);
      subscription.remove();
    };
  }, []);

  return day;
}
