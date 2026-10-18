import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState } from 'react-native';

import { createLogger } from '@/config/logger';
import {
  enableLocation,
  getLocationPermission,
  type LocationPermission,
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
  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

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
