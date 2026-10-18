import type { PermissionStep } from '@/onboarding/onboarding-service';

export type NotificationCardState = {
  ok: boolean;
  statusKey: string;
  fix: 'request' | 'openSettings' | null;
};

export type BatteryCardState = {
  ok: boolean;
  statusKey: string;
};

export function notificationCardState(
  step: PermissionStep,
): NotificationCardState {
  if (step === 'granted') {
    return { ok: true, statusKey: 'settings.notificationsGranted', fix: null };
  }
  if (step === 'askable') {
    return {
      ok: false,
      statusKey: 'settings.notificationsAskable',
      fix: 'request',
    };
  }
  return {
    ok: false,
    statusKey: 'settings.notificationsBlocked',
    fix: 'openSettings',
  };
}

export function batteryCardState(
  optimizationEnabled: boolean,
): BatteryCardState {
  return optimizationEnabled
    ? { ok: false, statusKey: 'settings.batteryRestricted' }
    : { ok: true, statusKey: 'settings.batteryUnrestricted' };
}
