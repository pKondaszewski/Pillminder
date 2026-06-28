import { useEffect } from 'react';
import { AppState } from 'react-native';

import { createLogger } from '@/config/logger';
import { syncAllSchedules } from '@/doses/dose-service';

const log = createLogger('use-dose-sync');

export function useDoseSync(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;

    const sync = () =>
      syncAllSchedules().catch((err) => log.error('Dose sync failed', err));

    sync();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => subscription.remove();
  }, [enabled]);
}
