import { useEffect } from 'react';
import { AppState } from 'react-native';

import { createLogger } from '@/config/logger';
import { refreshAllReminders, syncAllSchedules } from '@/doses/dose-service';

const log = createLogger('use-dose-sync');

export function useDoseSync() {
  useEffect(() => {
    const sync = () =>
      syncAllSchedules().catch((err) => log.error('Dose sync failed', err));

    // Alarms can be gone while the database is not (e.g. after a restore), so the first start re-plans all.
    syncAllSchedules()
      .then(refreshAllReminders)
      .catch((err) => log.error('Dose sync failed', err));
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') sync();
    });

    return () => subscription.remove();
  }, []);
}
