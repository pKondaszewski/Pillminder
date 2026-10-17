import { addDays } from '@/config/date-utils';

const RETRY_DELAYS_MINUTES = [15, 45];

// Android caps an app at 500 alarms, so retries are planned only for the
// nearest days; every dose sync re-plans the doses that have entered this window.
const RETRY_HORIZON_DAYS = 7;

const MINUTE_MS = 60_000;

export type ReminderKind = 'first' | 'retry';

export interface PlannedNotification {
  identifier: string;
  kind: ReminderKind;
  at: Date;
}

export function planDoseNotifications(
  doseId: string,
  plannedAt: Date,
  now: Date,
): PlannedNotification[] {
  const first: PlannedNotification = {
    identifier: doseId,
    kind: 'first',
    at: plannedAt,
  };
  const retries = isWithinRetryHorizon(plannedAt, now)
    ? retryNotifications(doseId, plannedAt)
    : [];

  return [first, ...retries].filter(({ at }) => at > now);
}

export function isWithinRetryHorizon(plannedAt: Date, now: Date): boolean {
  return plannedAt < addDays(now, RETRY_HORIZON_DAYS);
}

export function doseNotificationIdentifiers(doseId: string): string[] {
  return [
    doseId,
    ...RETRY_DELAYS_MINUTES.map((_, index) => retryIdentifier(doseId, index)),
  ];
}

function retryIdentifier(doseId: string, index: number): string {
  return `${doseId}:retry:${index + 1}`;
}

function retryNotifications(
  doseId: string,
  plannedAt: Date,
): PlannedNotification[] {
  return RETRY_DELAYS_MINUTES.map((delay, index) => ({
    identifier: retryIdentifier(doseId, index),
    kind: 'retry' as const,
    at: new Date(plannedAt.getTime() + delay * MINUTE_MS),
  }));
}
