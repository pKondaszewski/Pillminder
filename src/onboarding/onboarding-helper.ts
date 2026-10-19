import type { NotificationPermission } from '@/notifications/notification-service';

import type { OnboardingStep, PermissionStep } from './dto/onboarding-step';

export function decideOnboardingSteps({
  permission,
  notificationsPromptDismissed,
  batteryOptimizationEnabled,
  batteryPromptDismissed,
  locationStep,
  locationPromptDismissed,
}: {
  permission: NotificationPermission;
  notificationsPromptDismissed: boolean;
  batteryOptimizationEnabled: boolean;
  batteryPromptDismissed: boolean;
  locationStep: PermissionStep;
  locationPromptDismissed: boolean;
}): OnboardingStep[] {
  const steps: OnboardingStep[] = [];
  if (!permission.granted && !notificationsPromptDismissed) {
    steps.push('notifications');
  }
  if (batteryOptimizationEnabled && !batteryPromptDismissed) {
    steps.push('battery');
  }
  if (locationStep === 'askable' && !locationPromptDismissed) {
    steps.push('location');
  }
  return steps;
}

export function permissionStep(
  permission: NotificationPermission,
): PermissionStep {
  if (permission.granted) return 'granted';
  return permission.canAskAgain ? 'askable' : 'blocked';
}
