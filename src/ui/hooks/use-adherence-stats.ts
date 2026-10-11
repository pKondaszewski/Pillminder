import { useEffect, useState } from 'react';

import { createLogger } from '@/config/logger';
import {
  type AdherenceStats,
  getAdherenceStats,
  type TodayDose,
} from '@/doses/dose-service';

const log = createLogger('use-adherence-stats');

export function useAdherenceStats(
  todaysDoses: TodayDose[],
): AdherenceStats | null {
  const changeKey = todaysDoses.map(({ id, state }) => `${id}:${state}`).join();
  const [stats, setStats] = useState<AdherenceStats | null>(null);

  useEffect(() => {
    let cancelled = false;
    getAdherenceStats(new Date())
      .then((result) => {
        if (!cancelled) setStats(result);
      })
      .catch((err) => log.error('Failed to load adherence stats', err));
    return () => {
      cancelled = true;
    };
  }, [changeKey]);

  return stats;
}
