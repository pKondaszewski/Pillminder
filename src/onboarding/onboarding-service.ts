import { isBatteryOptimizationEnabled } from '@/battery/battery-service';
import { getNotificationPermission } from '@/notifications/notification-service';
import {
  isBatteryPromptDismissed,
  isNotificationsPromptDismissed,
} from '@/settings/settings-service';

import {
  decideOnboardingSteps,
  type OnboardingStep,
} from './onboarding-helper';

export type { OnboardingStep } from './onboarding-helper';
export { permissionStep } from './onboarding-helper';
export { openBatteryOptimizationSettings } from '@/battery/battery-service';
export type { NotificationPermission } from '@/notifications/notification-service';
export {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/notifications/notification-service';
export {
  dismissBatteryPrompt,
  dismissNotificationsPrompt,
} from '@/settings/settings-service';

export async function getOnboardingSteps(): Promise<OnboardingStep[]> {
  return decideOnboardingSteps({
    permission: await getNotificationPermission(),
    notificationsPromptDismissed: isNotificationsPromptDismissed(),
    batteryOptimizationEnabled: await isBatteryOptimizationEnabled(),
    batteryPromptDismissed: isBatteryPromptDismissed(),
  });
}
