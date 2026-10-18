import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { exportBackup, replaceAllWithBackup } from '@/backup/backup-service';
import { useBackupImport } from '@/ui/hooks/use-backup-import';

export function useBackup() {
  const { t } = useTranslation();
  const { busy, run, importData, importConfirmation } = useBackupImport(
    async (rows) => {
      await replaceAllWithBackup(rows);
      Alert.alert(t('backup.importDone'));
    },
    t('backup.importFailed'),
  );

  return {
    busy,
    exportData: () =>
      run(() => exportBackup(t('backup.shareTitle')), t('backup.exportFailed')),
    importData,
    importConfirmation,
  };
}
