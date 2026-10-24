import { ActivityAction, startActivityAsync } from 'expo-intent-launcher';

export async function openGoogleBackupSettings(): Promise<void> {
  await startActivityAsync(ActivityAction.BACKUP_SETTINGS);
}
