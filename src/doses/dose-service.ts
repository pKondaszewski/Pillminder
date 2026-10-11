import { addDays, startOfDay } from '@/config/date-utils';
import i18n from '@/config/i18n';
import { createLogger } from '@/config/logger';
import {
  cancelDoseReminder,
  cancelDoseReminders,
  dismissDoseReminder,
  scheduleDoseReminder,
} from '@/notifications/notification-service';
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
  type Schedule,
} from '@/schedules/schedule-service';
import { getSnoozeMinutes } from '@/settings/settings-service';

import { calculateAdherence, calculateStreak } from './dose-adherence';
import { reminderBody } from './dose-label';
import {
  deleteFuturePendingDoseRowsForSchedules,
  dosesBetweenQuery,
  getDoseById,
  getDosesPlannedBetween,
  getFuturePendingDosesByProduct,
  productHistoryQuery,
  replaceFuturePendingDoseRows,
  setDoseSnoozedUntilRow,
  setDoseStateRow,
} from './dose-repository';
import { isDueInFuture, isPending } from './dose-validator';
import type {
  AdherenceReport,
  AdherenceStats,
} from './dto/adherence-report-output';

export type { DayStatus, ProductDoses } from './dose-day';
export { dayStatus, groupDosesByProduct } from './dose-day';
export { toHistoryEntries } from './dose-history';
export { doseQuantityText } from './dose-label';
export { BULK_TAKE_MIN_OVERDUE, overdueDoses } from './dose-overdue';
export { groupDosesByTimeSlot } from './dose-time-slot';
export { toTodayDose } from './dose-today';
export type {
  AdherenceCounts,
  AdherenceReport,
  AdherenceStats,
} from './dto/adherence-report-output';
export type { HistoryEntry } from './dto/history-entry-output';
export type { TodayDose } from './dto/today-dose-output';

const log = createLogger('dose-service');

const HORIZON_DAYS = 30;

function reminderStrings(product: Product, quantity: number) {
  const name = productLabel(product.name, product.strength);
  return {
    title: i18n.t('notification.title'),
    body: reminderBody(name, quantity, product.unit, (key, options) =>
      i18n.t(key, options),
    ),
  };
}

export function getDosesBetweenQuery(from: Date, to: Date) {
  return dosesBetweenQuery(from, to);
}

export function getProductHistoryQuery(productId: string) {
  return productHistoryQuery(productId);
}

export async function getAdherence(
  from: Date,
  to: Date,
  now: Date,
): Promise<AdherenceReport> {
  const doses = await getDosesPlannedBetween(from, to);
  return calculateAdherence(doses, from, to, now);
}

export async function getAdherenceStats(now: Date): Promise<AdherenceStats> {
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const loaded = await getDosesPlannedBetween(new Date(0), monthEnd);
  const untilToday = loaded.filter(
    ({ plannedAt }) => plannedAt < addDays(startOfDay(now), 1),
  );
  const { taken, due } = calculateAdherence(
    loaded,
    monthStart,
    monthEnd,
    now,
  ).total;
  return { taken, due, streak: calculateStreak(untilToday, now) };
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
  const quantityByScheduleId = new Map(
    (await getSchedulesByProduct(productId)).map((s) => [s.id, s.quantity]),
  );
  log.info(`Refreshing ${pending.length} reminder(s) for product ${productId}`);
  await Promise.all(
    pending.map((dose) =>
      scheduleDoseReminder(
        { id: dose.id, productName: product.name, plannedAt: dose.plannedAt },
        reminderStrings(
          product,
          quantityByScheduleId.get(dose.scheduleId) ?? 1,
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

export async function untakeDose(id: string): Promise<void> {
  await revertDoseToPending(id);
}

export async function skipDose(id: string): Promise<void> {
  await applyDoseState(id, 'skipped');
}

export async function unskipDose(id: string): Promise<void> {
  await revertDoseToPending(id);
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
      { id: dose.id, productName: product.name, plannedAt: when },
      reminderStrings(product, await quantityForDose(dose.scheduleId)),
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
    const from = new Date();

    const slots =
      product?.status === 'archived'
        ? []
        : occurrencesWithin(
            schedule.intervalDays,
            schedule.timesOfDay,
            HORIZON_DAYS,
            schedule,
            from,
          );

    log.info(
      `Syncing ${slots.length} dose slot(s) for schedule ${schedule.id}`,
    );
    try {
      const { removedIds, inserted } = await replaceFuturePendingDoseRows(
        schedule.id,
        from,
        slots.map((plannedAt) => ({
          productId: schedule.productId,
          scheduleId: schedule.id,
          plannedAt,
        })),
      );

      await cancelDoseReminders(removedIds);
      if (!product) continue;

      await Promise.all(
        inserted.map((dose) =>
          scheduleDoseReminder(
            {
              id: dose.id,
              productName: product.name,
              plannedAt: dose.plannedAt,
            },
            reminderStrings(product, schedule.quantity),
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

async function quantityForDose(scheduleId: string): Promise<number> {
  return (await getSchedule(scheduleId))?.quantity ?? 1;
}

async function revertDoseToPending(id: string): Promise<void> {
  log.info(`Reverting dose ${id} to pending`);
  try {
    await setDoseStateRow(id, 'pending');

    const dose = await getDoseById(id);
    if (!dose || !isDueInFuture(dose)) return;

    const product = await getProduct(dose.productId);
    if (!product) return;

    await scheduleDoseReminder(
      { id: dose.id, productName: product.name, plannedAt: dose.plannedAt },
      reminderStrings(product, await quantityForDose(dose.scheduleId)),
    );
  } catch (err) {
    log.error(`Failed to revert dose ${id}`, err);
    throw err;
  }
}
