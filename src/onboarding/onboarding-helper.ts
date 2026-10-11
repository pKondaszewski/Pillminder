import type { NotificationPermission } from '@/notifications/notification-service';

export type OnboardingStep = 'notifications' | 'battery';

export type PermissionStep = 'askable' | 'blocked' | 'granted';

export function decideOnboardingSteps({
  permission,
  notificationsPromptDismissed,
  batteryOptimizationEnabled,
  batteryPromptDismissed,
}: {
  permission: NotificationPermission;
  notificationsPromptDismissed: boolean;
  batteryOptimizationEnabled: boolean;
  batteryPromptDismissed: boolean;
}): OnboardingStep[] {
  const steps: OnboardingStep[] = [];
  if (!permission.granted && !notificationsPromptDismissed) {
    steps.push('notifications');
  }
  if (batteryOptimizationEnabled && !batteryPromptDismissed) {
    steps.push('battery');
  }
  return steps;
}

export function permissionStep(
  permission: NotificationPermission,
): PermissionStep {
  if (permission.granted) return 'granted';
  return permission.canAskAgain ? 'askable' : 'blocked';
}
