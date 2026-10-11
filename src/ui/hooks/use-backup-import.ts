import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import {
  type BackupError,
  type BackupRows,
  pickBackup,
} from '@/backup/backup-service';
import { createLogger } from '@/config/logger';

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

  const showInvalidFile = ({ code, detail }: BackupError) =>
    Alert.alert(
      t('backup.importInvalidTitle'),
      [t(`backup.error.${code}`), detail].filter(Boolean).join('\n'),
    );

  const confirmReplace = (rows: BackupRows) =>
    Alert.alert(
      t('backup.confirmTitle'),
      t('backup.confirmMessage', {
        products: rows.products.length,
        schedules: rows.schedules.length,
        doses: rows.doses.length,
        notes: rows.notes.length,
      }),
      [
        { text: t('backup.cancel'), style: 'cancel' },
        {
          text: t('backup.confirmAction'),
          style: 'destructive',
          onPress: () => void run(() => applyRows(rows)),
        },
      ],
    );

  const importData = () =>
    run(async () => {
      const result = await pickBackup();
      if (!result) return;
      if (result.ok) confirmReplace(result.rows);
      else showInvalidFile(result.error);
    });

  return { busy, run, importData };
}
