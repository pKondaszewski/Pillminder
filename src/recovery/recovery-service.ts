import { migrate } from 'drizzle-orm/expo-sqlite/migrator';

import { type BackupRows, replaceAllWithBackup } from '@/backup/backup-service';
import { db } from '@/config/db/database';
import { dropAllTables } from '@/config/db/database-reset';
import { deleteAllImageFiles } from '@/images/image-service';
import { cancelAllNotifications } from '@/notifications/notification-service';

import migrations from '../../drizzle/migrations';

// Takes already parsed rows on purpose: picking and validating the file
// happens before anything is wiped, so a bad file never reaches this point.
export async function restoreFromBackup(rows: BackupRows): Promise<void> {
  await wipe();
  await migrate(db, migrations);
  await replaceAllWithBackup(rows);
}

// Migrations are left to the caller: the app re-runs them when it remounts.
export async function resetData(): Promise<void> {
  await wipe();
}

async function wipe(): Promise<void> {
  dropAllTables();
  deleteAllImageFiles();
  // The previous rows may be unreadable, so orphans cannot be picked by id
  await cancelAllNotifications();
}
