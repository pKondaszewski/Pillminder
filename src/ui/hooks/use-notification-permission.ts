import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState } from 'react-native';

import { createLogger } from '@/config/logger';
import {
  getNotificationPermission,
  type NotificationPermission,
  requestNotificationPermission,
} from '@/onboarding/onboarding-service';

const log = createLogger('use-notification-permission');

export function useNotificationPermission() {
  const { t } = useTranslation();
  const [permission, setPermission] = useState<NotificationPermission | null>(
    null,
  );
  const [busy, setBusy] = useState(false);

  const showFailure = useCallback(
    (err: unknown) => {
      log.error('Notification permission call failed', err);
      Alert.alert(
        t('onboarding.permissionFailed'),
        err instanceof Error ? err.message : '',
      );
    },
    [t],
  );

  const refresh = useCallback(
    () => getNotificationPermission().then(setPermission).catch(showFailure),
    [showFailure],
  );

  // The user may grant the permission in system settings and come back
  useEffect(() => {
    void refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  const request = async () => {
    setBusy(true);
    try {
      setPermission(await requestNotificationPermission());
    } catch (err) {
      showFailure(err);
    } finally {
      setBusy(false);
    }
  };

  return { permission, busy, request };
}
