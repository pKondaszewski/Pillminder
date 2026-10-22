import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { createLogger } from '@/config/logger';
import { setAppLockEnabled } from '@/settings/settings-service';

import { authenticate, isDeviceSecured } from '../app-lock-service';

const log = createLogger('use-app-lock-setting');

export function useAppLockSetting() {
  const { t } = useTranslation();
  const [available, setAvailable] = useState<boolean | null>(null);

  const refresh = useCallback(
    () =>
      isDeviceSecured()
        .then(setAvailable)
        .catch((err) => log.error('Screen lock check failed', err)),
    [],
  );

  // The user sets a screen lock on a system screen and comes back
  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const change = async (enable: boolean): Promise<void> => {
    if (!enable) {
      setAppLockEnabled(false);
      return;
    }
    try {
      const result = await authenticate(t('appLock.confirmPrompt'));
      if (result === 'success') setAppLockEnabled(true);
    } catch (err) {
      log.error('Confirming the app lock failed', err);
    }
  };

  return { available, change };
}
