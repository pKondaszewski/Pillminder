import { addDays } from '@/config/date-utils';

import type { DoseReminder } from './dto/dose-reminder';

const RETRY_DELAYS_MINUTES = [15, 45];

// Android caps an app at 500 alarms, so retries are planned only for the
// nearest days; every dose sync re-plans the doses that have entered this window.
const RETRY_HORIZON_DAYS = 7;

// Android allows 500 alarms per app and one scheduled notification is one alarm.
// The rest is left for the snoozes and retries of overdue doses and the reorder alerts.
const ALARM_BUDGET = 450;

const MINUTE_MS = 60_000;

export type ReminderKind = 'first' | 'retry';

export interface PlannedNotification {
  identifier: string;
  doseId: string;
  kind: ReminderKind;
  at: Date;
}

export interface ReminderAlarmPlan {
  scheduled: PlannedNotification[];
  dropped: string[];
}

export function planDoseNotifications(
  doseId: string,
  plannedAt: Date,
  now: Date,
): PlannedNotification[] {
  const first: PlannedNotification = {
    identifier: doseId,
    doseId,
    kind: 'first',
    at: plannedAt,
  };
  const retries = isWithinRetryHorizon(plannedAt, now)
    ? retryNotifications(doseId, plannedAt)
    : [];

  return [first, ...retries].filter(({ at }) => at > now);
}

export function planReminderAlarms(
  doses: DoseReminder[],
  now: Date,
  budget: number = ALARM_BUDGET,
): ReminderAlarmPlan {
  const candidates = doses
    .flatMap(({ id, plannedAt }) => planDoseNotifications(id, plannedAt, now))
    .sort(byPriority);

  return {
    scheduled: candidates.slice(0, budget),
    dropped: candidates.slice(budget).map(({ identifier }) => identifier),
  };
}

function isWithinRetryHorizon(plannedAt: Date, now: Date): boolean {
  return plannedAt < addDays(now, RETRY_HORIZON_DAYS);
}

export function doseNotificationIdentifiers(doseId: string): string[] {
  return [
    doseId,
    ...RETRY_DELAYS_MINUTES.map((_, index) => retryIdentifier(doseId, index)),
  ];
}

function byPriority(a: PlannedNotification, b: PlannedNotification): number {
  if (a.kind !== b.kind) return a.kind === 'first' ? -1 : 1;
  return a.at.getTime() - b.at.getTime();
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
    doseId,
    kind: 'retry' as const,
    at: new Date(plannedAt.getTime() + delay * MINUTE_MS),
  }));
}
