import type { NotificationPermission } from '@/notifications/notification-service';

export type OnboardingDecision = 'show' | 'skip';

export type PermissionStep = 'askable' | 'blocked' | 'granted';

export function decideOnboarding(
  promptDismissed: boolean,
  permission: NotificationPermission,
): OnboardingDecision {
  if (permission.granted || promptDismissed) return 'skip';
  return 'show';
}

export function permissionStep(
  permission: NotificationPermission,
): PermissionStep {
  if (permission.granted) return 'granted';
  return permission.canAskAgain ? 'askable' : 'blocked';
}
