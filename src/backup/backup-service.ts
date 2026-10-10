import * as DocumentPicker from 'expo-document-picker';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { createLogger } from '@/config/logger';
import { deleteStaleCacheFiles } from '@/config/stale-files';
import { refreshAllReminders, syncAllSchedules } from '@/doses/dose-service';
import {
  cancelDoseReminders,
  cancelReorderAlert,
  dismissDoseReminder,
} from '@/notifications/notification-service';

import {
  type BackupParseResult,
  type BackupRows,
  parseBackup,
  serializeBackup,
} from './backup-format';
import { readAllRows, replaceAllRows } from './backup-repository';

export type { BackupError, BackupRows } from './backup-format';

const log = createLogger('backup-service');

const BACKUP_MIME_TYPE = 'application/json';
const BACKUP_FILE_PATTERN = /^pillminder-backup-.*\.json$/;

export async function exportBackup(dialogTitle: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device');
  }

  const now = new Date();
  const json = serializeBackup(await readAllRows(), now);

  deleteStaleCacheFiles(BACKUP_FILE_PATTERN);
  const file = new File(
    Paths.cache,
    `pillminder-backup-${now.toISOString().slice(0, 10)}.json`,
  );
  file.create({ overwrite: true });
  file.write(json);

  log.info(`Exporting backup (${json.length} chars)`);
  await Sharing.shareAsync(file.uri, {
    mimeType: BACKUP_MIME_TYPE,
    dialogTitle,
  });
}

export async function pickBackup(): Promise<BackupParseResult | null> {
  const picked = await DocumentPicker.getDocumentAsync({
    type: '*/*',
    copyToCacheDirectory: true,
    multiple: false,
  });
  if (picked.canceled) return null;

  const file = new File(picked.assets[0].uri);
  try {
    return parseBackup(await file.text());
  } finally {
    file.delete();
  }
}

export async function replaceAllWithBackup(rows: BackupRows): Promise<void> {
  log.info('Replacing all data with imported backup');
  const previous = await readAllRows();
  replaceAllRows(rows);

  // The data is committed at this point; a failure below only leaves
  // reminders to be rebuilt by the next app start.
  try {
    await cancelOrphanedNotifications(previous, rows);
    await syncAllSchedules();
    await refreshAllReminders();
  } catch (err) {
    log.error('Rebuilding reminders after import failed', err);
  }
}

// Only ids missing from the imported data are cancelled. Ids that survive are
// rescheduled in place, and reorder alerts are re-evaluated by
// useReorderNotifications once the products live query emits.
async function cancelOrphanedNotifications(
  previous: BackupRows,
  imported: BackupRows,
): Promise<void> {
  const orphanIds = (table: 'doses' | 'products') => {
    const kept = new Set(imported[table].map((row) => row.id));
    return previous[table]
      .map((row) => String(row.id))
      .filter((id) => !kept.has(id));
  };

  const doseIds = orphanIds('doses');
  await Promise.all([
    cancelDoseReminders(doseIds),
    ...doseIds.map(dismissDoseReminder),
    ...orphanIds('products').map(cancelReorderAlert),
  ]);
}
