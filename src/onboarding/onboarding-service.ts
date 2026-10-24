import { isBatteryOptimizationEnabled } from '@/battery/battery-service';
import { getLocationPermission } from '@/location/location-service';
import { getNotificationPermission } from '@/notifications/notification-service';
import {
  isBatteryPromptDismissed,
  isLocationPromptDismissed,
  isNotificationsPromptDismissed,
} from '@/settings/settings-service';

import type { OnboardingStep } from './dto/onboarding-step';
import { decideOnboardingSteps, permissionStep } from './onboarding-helper';

export type { OnboardingStep, PermissionStep } from './dto/onboarding-step';
export { permissionStep } from './onboarding-helper';
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
