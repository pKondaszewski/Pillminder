import { startOfDay } from '@/config/date-utils';
import i18n from '@/config/i18n';
import { createLogger } from '@/config/logger';
import {
  cancelDoseReminder,
  cancelDoseReminders,
  dismissDoseReminder,
  scheduleDoseReminder,
} from '@/notifications/notification-service';
import { isWithinRetryHorizon } from '@/notifications/reminder-plan';
import { productLabel } from '@/products/product-label';
import {
  getProduct,
  getProducts,
  getProductsQuery,
  type Product,
} from '@/products/product-service';
import {
  getSchedule,
  getSchedules,
  getSchedulesByProduct,
  occurrencesWithin,
  quantityOn,
  type Schedule,
} from '@/schedules/schedule-service';
import { getSnoozeMinutes } from '@/settings/settings-service';

import { DOSE_HORIZON_DAYS } from './dose-day';
import { reminderBody } from './dose-label';
import {
  deleteFuturePendingDoseRowsForSchedules,
  dosesBetweenQuery,
  getDoseById,
  getFuturePendingDosesByProduct,
  getPendingDoseIdsForSchedules,
  productDosesBetweenQuery,
  replacePendingDoseRows,
  restoreDoseRow,
  setDoseSnoozedUntilRow,
  setDoseStateRow,
} from './dose-repository';
import { isDueInFuture, isPending } from './dose-validator';
import type { DoseSnapshot } from './dto/dose-snapshot';

export { dayPhases } from './day-phases';
export { dayStatus, lastPlannedDay } from './dose-day';
export {
  dayCountsText,
  doseDetailsText,
  doseQuantityText,
  durationText,
  handledCountsText,
  monthSummaryText,
  stockEffectText,
} from './dose-label';
export { monthSummary } from './dose-month';
export { activeSnoozeEnd, doseStatus } from './dose-status';
export { buildRecentDays, recentDaysRange } from './dose-strip';
export { groupDosesByTimeSlot, timeSlotLayout } from './dose-time-slot';
export { buildTimeline, nowPosition } from './dose-timeline';
export { toTodayDose } from './dose-today';
export { BULK_TAKE_MIN_OVERDUE, todayCardState } from './dose-today-card';
export type { CorrectionTarget } from './dto/correction-target';
export type { DayStatus } from './dto/day-status';
export type { DoseSnapshot } from './dto/dose-snapshot';
export type { DoseStatus } from './dto/dose-status';
export type { RecentDays } from './dto/recent-days-output';
export type { TimeSlotGroup } from './dto/time-slot-output';
export type { TimelineMark } from './dto/timeline-mark';
export type { TodayCardState } from './dto/today-card-state';
export type { TodayDose } from './dto/today-dose-output';

const log = createLogger('dose-service');

export function getDosesBetweenQuery(from: Date, to: Date) {
  return dosesBetweenQuery(from, to);
}

export function getProductDosesBetweenQuery(
  productId: string,
  from: Date,
  to: Date,
) {
  return productDosesBetweenQuery(productId, from, to);
}

export async function cancelPendingReminders(
  scheduleIds: string[],
): Promise<void> {
  const scheduleList = scheduleIds.join(', ');
  try {
    await cancelDoseReminders(await getPendingDoseIdsForSchedules(scheduleIds));
  } catch (err) {
    log.error(
      `Failed to cancel pending reminders for schedule(s) ${scheduleList}`,
      err,
    );
    throw err;
  }
}

export async function cancelFutureDosesForSchedules(
  scheduleIds: string[],
): Promise<void> {
  if (scheduleIds.length === 0) return;
  const scheduleList = scheduleIds.join(', ');
  log.info(`Cancelling future doses for schedule(s) ${scheduleList}`);
  try {
    const removedIds = await deleteFuturePendingDoseRowsForSchedules(
      scheduleIds,
      new Date(),
    );
    await cancelDoseReminders(removedIds);
  } catch (err) {
    log.error(
      `Failed to cancel future doses for schedule(s) ${scheduleList}`,
      err,
    );
    throw err;
  }
}

export async function refreshRemindersForProduct(
  productId: string,
): Promise<void> {
  const product = await getProduct(productId);
  if (!product || product.status === 'archived') return;

  const pending = await getFuturePendingDosesByProduct(productId);
  const scheduleById = new Map(
    (await getSchedulesByProduct(productId)).map((s) => [s.id, s]),
  );
  log.info(`Refreshing ${pending.length} reminder(s) for product ${productId}`);
  await Promise.all(
    pending.map((dose) =>
      scheduleDoseReminder(
        { id: dose.id, plannedAt: dose.plannedAt },
        reminderTexts(
          product,
          quantityOfDose(
            dose,
            dose.scheduleId ? scheduleById.get(dose.scheduleId) : undefined,
          ),
        ),
      ),
    ),
  );
}

export async function refreshAllReminders(): Promise<void> {
  const products = await getProductsQuery();
  await Promise.all(products.map((p) => refreshRemindersForProduct(p.id)));
}

export async function takeDose(id: string): Promise<void> {
  await applyDoseState(id, 'taken');
}

export async function skipDose(id: string): Promise<void> {
  await applyDoseState(id, 'skipped');
}

export async function revertDose(id: string): Promise<void> {
  log.info(`Reverting dose ${id} to pending`);
  try {
    await setDoseStateRow(id, 'pending');
    await rescheduleReminderIfDue(id);
  } catch (err) {
    log.error(`Failed to revert dose ${id}`, err);
    throw err;
  }
}

export async function restoreDose(snapshot: DoseSnapshot): Promise<void> {
  const { id, state } = snapshot;
  log.info(`Restoring dose ${id} to ${state}`);
  try {
    await restoreDoseRow(snapshot);
    if (state === 'pending') await rescheduleReminderIfDue(id);
    else await cancelDoseReminder(id);
  } catch (err) {
    log.error(`Failed to restore dose ${id}`, err);
    throw err;
  }
}

export async function correctDoseState(
  id: string,
  target: 'taken' | 'skipped',
): Promise<void> {
  await applyDoseState(id, target, { backdated: true });
}

export async function snoozeDose(id: string): Promise<void> {
  const snoozeMinutes = getSnoozeMinutes();
  log.info(`Snoozing dose ${id} by ${snoozeMinutes} min`);
  try {
    const dose = await getDoseById(id);
    if (!dose || !isPending(dose)) return;
    const product = await getProduct(dose.productId);
    if (!product) return;

    const when = new Date(Date.now() + snoozeMinutes * 60 * 1000);
    await scheduleDoseReminder(
      { id: dose.id, plannedAt: when },
      reminderTexts(product, quantityOfDose(dose, await scheduleOfDose(dose))),
    );
    await setDoseSnoozedUntilRow(dose.id, when);
    await dismissDoseReminder(dose.id);
  } catch (err) {
    log.error(`Failed to snooze dose ${id}`, err);
  }
}

export async function syncAllSchedules(): Promise<void> {
  const schedules = await getSchedules();
  await syncDosesForSchedules(schedules);
}

export async function syncDosesForSchedules(
  schedules: Schedule[],
): Promise<void> {
  log.info(
    `Syncing doses for schedule(s) ${schedules.map((s) => s.id).join(', ')}`,
  );

  const productIds = [...new Set(schedules.map((s) => s.productId))];
  const products = await getProducts(productIds);
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const schedule of schedules) {
    const product = productById.get(schedule.productId);
    const now = new Date();
    const from = startOfDay(now);

    const slots =
      product?.status === 'archived'
        ? []
        : occurrencesWithin(
            schedule,
            schedule.timesOfDay,
            DOSE_HORIZON_DAYS,
            schedule,
            from,
          );

    log.info(
      `Syncing ${slots.length} dose slot(s) for schedule ${schedule.id}`,
    );
    try {
      const { removedIds, inserted, kept } = await replacePendingDoseRows(
        schedule.id,
        from,
        now,
        slots.map((plannedAt) => ({
          productId: schedule.productId,
          scheduleId: schedule.id,
          plannedAt,
        })),
      );

      await cancelDoseReminders(removedIds);
      if (!product) continue;

      const toSchedule = [
        ...inserted,
        ...kept.filter(({ plannedAt }) => isWithinRetryHorizon(plannedAt, now)),
      ];
      await Promise.all(
        toSchedule.map((dose) =>
          scheduleDoseReminder(
            {
              id: dose.id,
              plannedAt: dose.plannedAt,
            },
            reminderTexts(product, quantityOfDose(dose, schedule)),
          ),
        ),
      );
    } catch (err) {
      log.error(`Failed to sync doses for schedule ${schedule.id}`, err);
      throw err;
    }
  }
}

export async function syncDosesForSchedule(schedule: Schedule): Promise<void> {
  await syncDosesForSchedules([schedule]);
}

async function applyDoseState(
  id: string,
  state: 'taken' | 'skipped',
  { backdated }: { backdated?: boolean } = {},
): Promise<void> {
  const change = `dose ${id} to ${state}${backdated ? ' (backdated)' : ''}`;
  log.info(`Setting ${change}`);
  try {
    await setDoseStateRow(id, state, { backdated });
    await cancelDoseReminder(id);
  } catch (err) {
    log.error(`Failed to set ${change}`, err);
    throw err;
  }
}

async function rescheduleReminderIfDue(id: string): Promise<void> {
  const dose = await getDoseById(id);
  if (!dose || !isDueInFuture(dose, new Date())) return;

  const product = await getProduct(dose.productId);
  if (!product) return;

  await scheduleDoseReminder(
    { id: dose.id, plannedAt: dose.plannedAt },
    reminderTexts(product, quantityOfDose(dose, await scheduleOfDose(dose))),
  );
}

function reminderTexts(product: Product, quantity: number) {
  const name = productLabel(product.name, product.strength);
  const body = reminderBody(
    name,
    quantity,
    product.unit,
    product.fasting,
    (key, options) => i18n.t(key, options),
  );
  return {
    first: { title: i18n.t('notification.title'), body },
    retry: { title: i18n.t('notification.retryTitle'), body },
  };
}

async function scheduleOfDose({
  scheduleId,
}: {
  scheduleId: string | null;
}): Promise<Schedule | undefined> {
  return scheduleId ? getSchedule(scheduleId) : undefined;
}

function quantityOfDose(
  { plannedAt }: { plannedAt: Date },
  schedule: Schedule | undefined,
): number {
  return schedule ? quantityOn(schedule, schedule.quantity, plannedAt) : 1;
}
