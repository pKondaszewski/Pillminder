import { useTranslation } from 'react-i18next';

import { useBackupImport } from '@/backup/ui/use-backup-import';
import { useConfirmation } from '@/commons/ui/use-confirmation';
import { resetData, restoreFromBackup } from '@/recovery/recovery-service';

export function useMigrationRecovery(onRerunMigrations: () => void) {
  const { t } = useTranslation();
  const { busy, run, importData, importConfirmation } = useBackupImport(
    async (rows) => {
      await restoreFromBackup(rows);
      onRerunMigrations();
    },
    t('migrationError.restoreFailed'),
  );

  const resetConfirmation = useConfirmation(
    () =>
      void run(async () => {
        await resetData();
        onRerunMigrations();
      }, t('migrationError.resetFailed')),
  );

  return {
    busy,
    retry: onRerunMigrations,
    restore: importData,
    reset: () => resetConfirmation.request(),
    importConfirmation,
    resetConfirmation,
  };
}
