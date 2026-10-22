import { useCallback, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { AppState } from 'react-native';

import { createLogger } from '@/config/logger';
import { setAppLockEnabled } from '@/settings/settings-service';
import { useSettings } from '@/settings/ui/use-settings';

import { shouldLockOnResume } from '../app-lock-policy';
import { authenticate, setScreenCaptureBlocked } from '../app-lock-service';
import { setAppLocked } from '../app-lock-state';
import { useAppLocked } from './use-app-locked';

const log = createLogger('use-app-lock');

export function useAppLock() {
  const { appLockEnabled: enabled } = useSettings();
  const { t } = useTranslation();
  const locked = useAppLocked();
  const authenticating = useRef(false);

  const unlock = useCallback(() => {
    if (authenticating.current) return;
    authenticating.current = true;
    authenticate(t('appLock.unlockPrompt'))
      .then((result) => {
        if (result === 'notSecured') setAppLockEnabled(false);
        if (result !== 'failed') setAppLocked(false);
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
    if (locked) unlock();
  }, [locked, unlock]);

  useEffect(() => {
    if (!enabled) return;
    let backgroundedAt: number | null = null;
    const subscription = AppState.addEventListener('change', (state) => {
      // The device PIN fallback can send the app to the background mid-prompt
      if (authenticating.current) return;
      if (state === 'background') backgroundedAt = Date.now();
      if (state === 'active') {
        if (shouldLockOnResume(backgroundedAt, Date.now())) setAppLocked(true);
        backgroundedAt = null;
      }
    });
    return () => subscription.remove();
  }, [enabled]);

  return { locked, unlock };
}
