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

import { calculateAdherence } from './dose-adherence';
import {
  deleteFuturePendingDosesForSchedules,
  getDoseById,
  getDosesPlannedBetween,
  getFuturePendingDosesByProduct,
  productHistoryQuery,
  replaceFuturePendingDoses,
  setDoseSnoozedUntil,
  setDoseState,
  todaysDosesQuery,
} from './dose-repository';
import { isDueInFuture, isPending, isPresent } from './dose-validator';
import type { AdherenceReport } from './dto/adherence-report-output';

export type {
  AdherenceCounts,
  AdherenceReport,
} from './dto/adherence-report-output';
export type { HistoryEntry } from './dto/history-entry-output';
export { toHistoryEntry } from './dto/history-entry-output';
export type { TodayDose } from './dto/today-dose-output';
export { toTodayDose } from './dto/today-dose-output';

const log = createLogger('dose-service');

const HORIZON_DAYS = 30;

function reminderStrings(product: Product, quantity: number) {
  const name = productLabel(product.name, product.strength);
  return {
    title: i18n.t('notification.title'),
    body:
      quantity > 1
        ? i18n.t('notification.bodyQuantity', { name, quantity })
        : i18n.t('notification.body', { name }),
  };
}

export function getTodaysDosesQuery() {
  return todaysDosesQuery();
}

export function getProductHistoryQuery(productId: string) {
  return productHistoryQuery(productId);
}

export async function getAdherence(
  from: Date,
  to: Date,
  now: Date = new Date(),
): Promise<AdherenceReport> {
  const doses = await getDosesPlannedBetween(from, to);
  return calculateAdherence(doses, from, to, now);
}

export async function cancelFutureDosesForSchedule(
  scheduleId: string,
): Promise<void> {
  log.info(`Cancelling future doses for schedule ${scheduleId}`);
  try {
    const { removedIds } = await replaceFuturePendingDoses(
      scheduleId,
      new Date(),
      [],
    );
    await cancelDoseReminders(removedIds);
  } catch (err) {
    log.error(`Failed to cancel future doses for schedule ${scheduleId}`, err);
    throw err;
  }
}

export async function cancelFutureDosesForSchedules(
  scheduleIds: string[],
): Promise<void> {
  if (scheduleIds.length === 0) return;
  log.info(`Cancelling future doses for ${scheduleIds.length} schedule(s)`);
  try {
    const removedIds = await deleteFuturePendingDosesForSchedules(
      scheduleIds,
      new Date(),
    );
    await cancelDoseReminders(removedIds);
  } catch (err) {
    log.error('Failed to cancel future doses for schedules', err);
    throw err;
  }
}

export async function refreshRemindersForProduct(
  productId: string,
): Promise<void> {
  const product = await getProduct(productId);
  if (!isPresent(product) || product.status === 'archived') return;

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
  log.info(`Marking dose ${id} as taken`);
  try {
    await setDoseState(id, 'taken');
    await Promise.all([cancelDoseReminder(id), dismissDoseReminder(id)]);
  } catch (err) {
    log.error(`Failed to mark dose ${id} as taken`, err);
    throw err;
  }
}

export async function untakeDose(id: string): Promise<void> {
  await revertDoseToPending(id);
}

export async function skipDose(id: string): Promise<void> {
  log.info(`Marking dose ${id} as skipped`);
  try {
    await setDoseState(id, 'skipped');
    await Promise.all([cancelDoseReminder(id), dismissDoseReminder(id)]);
  } catch (err) {
    log.error(`Failed to mark dose ${id} as skipped`, err);
    throw err;
  }
}

export async function unskipDose(id: string): Promise<void> {
  await revertDoseToPending(id);
}

export async function snoozeDose(id: string): Promise<void> {
  const snoozeMinutes = getSnoozeMinutes();
  log.info(`Snoozing dose ${id} by ${snoozeMinutes} min`);
  try {
    const dose = await getDoseById(id);
    if (!isPresent(dose) || !isPending(dose)) return;
    const product = await getProduct(dose.productId);
    if (!isPresent(product)) return;

    const when = new Date(Date.now() + snoozeMinutes * 60 * 1000);
    await scheduleDoseReminder(
      { id: dose.id, productName: product.name, plannedAt: when },
      reminderStrings(product, await quantityForDose(dose.scheduleId)),
    );
    await setDoseSnoozedUntil(dose.id, when);
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
  log.info(`Syncing doses for ${schedules.length} schedule(s)`);

  // Load every product referenced by the schedules in a single query, then
  // look each one up in memory — avoids one getProduct() round-trip per
  // schedule (the N+1 pattern).
  const productIds = [...new Set(schedules.map((s) => s.productId))];
  const products = await getProducts(productIds);
  const productById = new Map(products.map((p) => [p.id, p]));

  for (const schedule of schedules) {
    await syncDosesForScheduleWith(
      schedule,
      productById.get(schedule.productId),
    );
  }
}

export async function syncDosesForSchedule(schedule: Schedule): Promise<void> {
  const product = await getProduct(schedule.productId);
  return syncDosesForScheduleWith(schedule, product);
}

async function syncDosesForScheduleWith(
  schedule: Schedule,
  product: Product | undefined,
): Promise<void> {
  const from = new Date();

  const slots =
    product?.status === 'archived'
      ? []
      : occurrencesWithin(
          schedule.intervalDays,
          schedule.timesOfDay,
          HORIZON_DAYS,
          schedule,
        );

  log.info(`Syncing ${slots.length} dose slot(s) for schedule ${schedule.id}`);
  try {
    const { removedIds, inserted } = await replaceFuturePendingDoses(
      schedule.id,
      from,
      slots.map((plannedAt) => ({
        productId: schedule.productId,
        scheduleId: schedule.id,
        plannedAt,
      })),
    );

    await cancelDoseReminders(removedIds);
    if (!isPresent(product)) return;

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

async function quantityForDose(scheduleId: string): Promise<number> {
  return (await getSchedule(scheduleId))?.quantity ?? 1;
}

async function revertDoseToPending(id: string): Promise<void> {
  log.info(`Reverting dose ${id} to pending`);
  try {
    await setDoseState(id, 'pending');

    const dose = await getDoseById(id);
    if (!isPresent(dose) || !isDueInFuture(dose)) return;

    const product = await getProduct(dose.productId);
    if (!isPresent(product)) return;

    await scheduleDoseReminder(
      { id: dose.id, productName: product.name, plannedAt: dose.plannedAt },
      reminderStrings(product, await quantityForDose(dose.scheduleId)),
    );
  } catch (err) {
    log.error(`Failed to revert dose ${id}`, err);
    throw err;
  }
}
