import { isBatteryOptimizationEnabled } from '@/battery/battery-service';
import { getLocationPermission } from '@/location/location-service';
import { getNotificationPermission } from '@/notifications/notification-service';
import {
  isBatteryPromptDismissed,
  isLocationPromptDismissed,
  isNotificationsPromptDismissed,
} from '@/settings/settings-service';

import {
  decideOnboardingSteps,
  type OnboardingStep,
  permissionStep,
} from './onboarding-helper';

export type { OnboardingStep, PermissionStep } from './onboarding-helper';
export { permissionStep } from './onboarding-helper';
export type { NotificationPermission } from '@/notifications/notification-service';
export {
  getNotificationPermission,
  requestNotificationPermission,
} from '@/notifications/notification-service';
export {
  dismissBatteryPrompt,
  dismissLocationPrompt,
  dismissNotificationsPrompt,
} from '@/settings/settings-service';

export async function getOnboardingSteps(): Promise<OnboardingStep[]> {
  return decideOnboardingSteps({
    permission: await getNotificationPermission(),
    notificationsPromptDismissed: isNotificationsPromptDismissed(),
    batteryOptimizationEnabled: await isBatteryOptimizationEnabled(),
    batteryPromptDismissed: isBatteryPromptDismissed(),
    locationStep: permissionStep(await getLocationPermission()),
    locationPromptDismissed: isLocationPromptDismissed(),
  });
}
