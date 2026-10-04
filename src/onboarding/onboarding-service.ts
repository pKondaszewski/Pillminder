import { getNotificationPermission } from '@/notifications/notification-service';
import { isNotificationsPromptDismissed } from '@/settings/settings-service';

import { decideOnboarding } from './onboarding-helper';

export type { PermissionStep } from './onboarding-helper';
export { permissionStep } from './onboarding-helper';
export type { NotificationPermission } from '@/notifications/notification-service';
export {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/notifications/notification-service';
export { dismissNotificationsPrompt } from '@/settings/settings-service';

export async function shouldShowOnboarding(): Promise<boolean> {
  const decision = decideOnboarding(
    isNotificationsPromptDismissed(),
    await getNotificationPermission(),
  );
  return decision === 'show';
}
