import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { resetData, restoreFromBackup } from '@/recovery/recovery-service';
import { useBackupImport } from '@/ui/hooks/use-backup-import';

export function useMigrationRecovery(onRerunMigrations: () => void) {
  const { t } = useTranslation();
  const { busy, run, importData } = useBackupImport(async (rows) => {
    await restoreFromBackup(rows);
    onRerunMigrations();
  }, t('migrationError.restoreFailed'));

  const confirmReset = () =>
    Alert.alert(
      t('migrationError.resetConfirmTitle'),
      t('migrationError.resetConfirmMessage'),
      [
        { text: t('backup.cancel'), style: 'cancel' },
        {
          text: t('migrationError.resetConfirmAction'),
          style: 'destructive',
          onPress: () =>
            void run(async () => {
              await resetData();
              onRerunMigrations();
            }, t('migrationError.resetFailed')),
        },
      ],
    );

  return {
    busy,
    retry: onRerunMigrations,
    restore: importData,
    reset: confirmReset,
  };
}
