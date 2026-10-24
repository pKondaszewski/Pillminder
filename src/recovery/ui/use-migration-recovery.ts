import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useConfirmation } from '@/commons/ui/use-confirmation';
import { createLogger } from '@/config/logger';
import { resetData } from '@/recovery/recovery-service';

const log = createLogger('use-migration-recovery');

export function useMigrationRecovery(onRerunMigrations: () => void) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const reset = async () => {
    const title = t('migrationError.resetFailed');
    setBusy(true);
    try {
      await resetData();
      onRerunMigrations();
    } catch (err) {
      log.error(title, err);
      Alert.alert(title, err instanceof Error ? err.message : '');
    } finally {
      setBusy(false);
    }
  };

  const resetConfirmation = useConfirmation(() => void reset());

  return {
    busy,
    retry: onRerunMigrations,
    reset: () => resetConfirmation.request(),
    resetConfirmation,
  };
}
