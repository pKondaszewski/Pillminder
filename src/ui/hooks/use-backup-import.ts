import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import {
  type BackupError,
  type BackupRows,
  pickBackup,
} from '@/backup/backup-service';
import { createLogger } from '@/config/logger';
import { useConfirmation } from '@/ui/hooks/use-confirmation';

const log = createLogger('use-backup-import');

export function useBackupImport(
  applyRows: (rows: BackupRows) => Promise<void>,
  failureTitle: string,
) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>, title = failureTitle) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      log.error(title, err);
      Alert.alert(title, err instanceof Error ? err.message : '');
    } finally {
      setBusy(false);
    }
  };

  const importConfirmation = useConfirmation<BackupRows>(
    (rows) => void run(() => applyRows(rows)),
  );

  const showInvalidFile = ({ code, detail }: BackupError) =>
    Alert.alert(
      t('backup.importInvalidTitle'),
      [t(`backup.error.${code}`), detail].filter(Boolean).join('\n'),
    );

  const importData = () =>
    run(async () => {
      const result = await pickBackup();
      if (!result) return;
      if (result.ok) importConfirmation.request(result.rows);
      else showInvalidFile(result.error);
    });

  return { busy, run, importData, importConfirmation };
}
