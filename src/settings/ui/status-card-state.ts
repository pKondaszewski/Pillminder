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

export type GoogleBackupCardState = {
  ok: boolean;
  neutral: boolean;
  statusKey: string;
  actionKey: string;
};

export function googleBackupCardState(
  confirmed: boolean,
): GoogleBackupCardState {
  return confirmed
    ? {
        ok: true,
        neutral: false,
        statusKey: 'settings.googleBackupOn',
        actionKey: 'settings.googleBackupTurnOff',
      }
    : {
        ok: false,
        neutral: true,
        statusKey: 'settings.googleBackupCheck',
        actionKey: 'settings.fix',
      };
}

export type LocationCardState = {
  ok: boolean;
  neutral: boolean;
  statusKey: string;
  actionKey: string;
  action: 'enable' | 'disable' | 'openSettings';
};

export function locationCardState(
  step: PermissionStep,
  hasCoords: boolean,
): LocationCardState {
  if (step === 'granted' && hasCoords) {
    return {
      ok: true,
      neutral: false,
      statusKey: 'settings.locationOn',
      actionKey: 'settings.locationDisable',
      action: 'disable',
    };
  }
  if (step === 'blocked') {
    return {
      ok: false,
      neutral: false,
      statusKey: 'settings.locationBlocked',
      actionKey: 'settings.locationOpenSettings',
      action: 'openSettings',
    };
  }
  return {
    ok: false,
    neutral: true,
    statusKey: 'settings.locationOff',
    actionKey: 'settings.locationEnable',
    action: 'enable',
  };
}
