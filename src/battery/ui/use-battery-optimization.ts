import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import {
  isBatteryOptimizationEnabled,
  openBatteryOptimizationSettings,
} from '@/battery/battery-service';
import { useRefreshOnForeground } from '@/commons/ui/use-refresh-on-foreground';
import { createLogger } from '@/config/logger';

const log = createLogger('use-battery-optimization');

export function useBatteryOptimization() {
  const { t } = useTranslation();
  const [enabled, setEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    () =>
      isBatteryOptimizationEnabled()
        .then(setEnabled)
        .catch((err) => log.error('Battery optimization check failed', err)),
    [],
  );

  // The user changes the setting on a system screen and comes back
  useRefreshOnForeground(refresh);

  const openSettings = async (): Promise<boolean> => {
    setBusy(true);
    try {
      await openBatteryOptimizationSettings();
      return true;
    } catch (err) {
      log.error('Opening battery optimization settings failed', err);
      Alert.alert(
        t('onboarding.batteryFailed'),
        err instanceof Error ? err.message : '',
      );
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { enabled, busy, openSettings };
}
