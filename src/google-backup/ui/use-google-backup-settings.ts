import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, AppState } from 'react-native';

import { useConfirmation } from '@/commons/ui/use-confirmation';
import { createLogger } from '@/config/logger';
import {
  type BackupSettingsPhase,
  nextBackupSettingsPhase,
} from '@/google-backup/backup-settings-return';
import { openGoogleBackupSettings } from '@/google-backup/google-backup-service';
import { setGoogleBackupConfirmed } from '@/settings/settings-service';

const log = createLogger('use-google-backup-settings');

export function useGoogleBackupSettings() {
  const { t } = useTranslation();
  // A ref, not state: it only steers the AppState listener and never renders
  const phase = useRef<BackupSettingsPhase>('idle');
  // The value to store if the user confirms: set by the button that opened the screen
  const target = useRef(true);
  const question = useConfirmation(setGoogleBackupConfirmed);
  const { request } = question;

  // The user changes the setting on a system screen and comes back
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      const next = nextBackupSettingsPhase(phase.current, state);
      phase.current = next.phase;
      if (next.shouldAsk) request(target.current);
    });
    return () => subscription.remove();
  }, [request]);

  const openSettings = async (confirmed: boolean): Promise<void> => {
    target.current = confirmed;
    phase.current = 'opened';
    try {
      await openGoogleBackupSettings();
    } catch (err) {
      phase.current = 'idle';
      log.error('Opening Google backup settings failed', err);
      Alert.alert(
        t('settings.googleBackupFailed'),
        err instanceof Error ? err.message : '',
      );
    }
  };

  return { openSettings, question };
}
