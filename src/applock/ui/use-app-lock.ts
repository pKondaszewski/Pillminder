import { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { createLogger } from '@/config/logger';
import { setAppLockEnabled } from '@/settings/settings-service';

import { shouldLockOnResume } from '../app-lock-policy';
import { authenticate, setScreenCaptureBlocked } from '../app-lock-service';

const log = createLogger('use-app-lock');

export function useAppLock(enabled: boolean) {
  const { t } = useTranslation();
  const [locked, setLocked] = useState(enabled);
  const authenticating = useRef(false);

  const unlock = useCallback(() => {
    if (authenticating.current) return;
    authenticating.current = true;
    authenticate(t('appLock.unlockPrompt'))
      .then((result) => {
        if (result === 'notSecured') setAppLockEnabled(false);
        if (result !== 'failed') setLocked(false);
      })
      .catch((err) => log.error('Unlocking failed', err))
      .finally(() => {
        authenticating.current = false;
      });
  }, [t]);

  useEffect(() => {
    setScreenCaptureBlocked(enabled).catch((err) =>
      log.error('Switching screen capture protection failed', err),
    );
  }, [enabled]);

  useEffect(() => {
    if (enabled && locked) unlock();
  }, [enabled, locked, unlock]);

  useEffect(() => {
    if (!enabled) return;
    let backgroundedAt: number | null = null;
    const subscription = AppState.addEventListener('change', (state) => {
      // The device PIN fallback can send the app to the background mid-prompt
      if (authenticating.current) return;
      if (state === 'background') backgroundedAt = Date.now();
      if (state === 'active') {
        if (shouldLockOnResume(backgroundedAt, Date.now())) setLocked(true);
        backgroundedAt = null;
      }
    });
    return () => subscription.remove();
  }, [enabled]);

  return { locked: enabled && locked, unlock };
}
