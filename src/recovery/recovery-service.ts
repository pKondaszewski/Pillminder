import { dropAllTables } from '@/config/db/database-reset';
import { deleteAllImageFiles } from '@/images/image-service';
import { cancelAllNotifications } from '@/notifications/notification-service';

// Migrations are left to the caller: the app re-runs them when it remounts.
export async function resetData(): Promise<void> {
  dropAllTables();
  deleteAllImageFiles();
  // The previous rows may be unreadable, so orphans cannot be picked by id
  await cancelAllNotifications();
}
