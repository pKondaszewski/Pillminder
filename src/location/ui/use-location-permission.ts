import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useRefreshOnForeground } from '@/commons/ui/use-refresh-on-foreground';
import { createLogger } from '@/config/logger';
import type { LocationPermission } from '@/location/location-service';
import {
  enableLocation,
  getLocationPermission,
} from '@/location/location-service';
import { clearLocation } from '@/settings/settings-service';

const log = createLogger('use-location-permission');

export function useLocationPermission() {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<LocationPermission | null>(null);
  const [busy, setBusy] = useState(false);

  const refresh = useCallback(
    () =>
      getLocationPermission()
        .then(setPermission)
        .catch((err) => log.error('Location permission check failed', err)),
    [],
  );

  // The user may change the permission in system settings and come back
  useRefreshOnForeground(refresh);

  const enable = async (): Promise<boolean> => {
    setBusy(true);
    try {
      const result = await enableLocation(Date.now());
      setPermission(result);
      return result.granted;
    } catch (err) {
      log.error('Enabling location failed', err);
      Alert.alert(t('settings.locationFailed'));
      void refresh();
      return false;
    } finally {
      setBusy(false);
    }
  };

  return { permission, busy, enable, disable: clearLocation };
}
