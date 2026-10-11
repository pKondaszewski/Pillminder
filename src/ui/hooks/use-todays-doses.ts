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

import { useProducts } from './use-products';
import { useSchedules } from './use-schedules';

export function useTodaysDoses() {
  const day = useCurrentDay();
  const { products } = useProducts();
  const { schedules } = useSchedules();
  // useLiveQuery re-runs only on changes of the FROM table (doses), so product
  // and schedule edits are signalled through these live lists as deps.
  const { data } = useLiveQuery(getTodaysDosesQuery(new Date(day)), [
    day,
    products,
    schedules,
  ]);
  const doses = data.map(toTodayDose);

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
