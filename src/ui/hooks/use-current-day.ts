import { useEffect, useState } from 'react';
import { AppState } from 'react-native';

import { msUntilNextDay, startOfDay } from '@/config/date-utils';

export function useCurrentDay(): number {
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
