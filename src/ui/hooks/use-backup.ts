import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import {
  type BackupError,
  type BackupRows,
  exportBackup,
  pickBackup,
  replaceAllWithBackup,
} from '@/backup/backup-service';
import { createLogger } from '@/config/logger';

const log = createLogger('use-backup');

export function useBackup() {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const run = async (action: () => Promise<void>, failureTitle: string) => {
    setBusy(true);
    try {
      await action();
    } catch (err) {
      log.error(failureTitle, err);
      Alert.alert(failureTitle, err instanceof Error ? err.message : '');
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
          onPress: () =>
            void run(async () => {
              await replaceAllWithBackup(rows);
              Alert.alert(t('backup.importDone'));
            }, t('backup.importFailed')),
        },
      ],
    );

  return {
    busy,
    exportData: () =>
      run(() => exportBackup(t('backup.shareTitle')), t('backup.exportFailed')),
    importData: () =>
      run(async () => {
        const result = await pickBackup();
        if (!result) return;
        if (result.ok) confirmReplace(result.rows);
        else showInvalidFile(result.error);
      }, t('backup.importFailed')),
  };
}
