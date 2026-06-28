import i18n from '@/config/i18n';
import { createLogger } from '@/config/logger';
import {
  cancelDoseReminder,
  cancelDoseReminders,
  dismissDoseReminder,
  scheduleDoseReminder,
  SNOOZE_MINUTES,
} from '@/notifications/notification-service';
import { getProduct } from '@/products/product-service';
import {
  getSchedules,
  occurrencesWithin,
  type Schedule,
} from '@/schedules/schedule-service';

import {
  getDoseById,
  getFuturePendingDosesByProduct,
  productHistoryQuery,
  replaceFuturePendingDoses,
  setDoseSnoozedUntil,
  setDoseState,
  todaysDosesQuery,
} from './dose-repository';
import { isDueInFuture, isPending, isPresent } from './dose-validator';

export { toTodayDose } from './dto/today-dose-output';
export type { TodayDose } from './dto/today-dose-output';
export { toHistoryEntry } from './dto/history-entry-output';
export type { HistoryEntry } from './dto/history-entry-output';

const log = createLogger('dose-service');

const HORIZON_DAYS = 30;

function reminderStrings(productName: string) {
  return {
    title: i18n.t('notification.title'),
    body: i18n.t('notification.body', { name: productName }),
  };
}

export function getTodaysDosesQuery() {
  return todaysDosesQuery();
}

export function getProductHistoryQuery(productId: string) {
  return productHistoryQuery(productId);
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

export async function refreshRemindersForProduct(
  productId: string,
): Promise<void> {
  const product = await getProduct(productId);
  if (!isPresent(product) || product.status === 'archived') return;

  const pending = await getFuturePendingDosesByProduct(productId);
  log.info(`Refreshing ${pending.length} reminder(s) for product ${productId}`);
  await Promise.all(
    pending.map((dose) =>
      scheduleDoseReminder(
        { id: dose.id, productName: product.name, plannedAt: dose.plannedAt },
        reminderStrings(product.name),
      ),
    ),
  );
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
  log.info(`Reverting dose ${id} to pending`);
  try {
    await setDoseState(id, 'pending');

    const dose = await getDoseById(id);
    if (!isPresent(dose) || !isDueInFuture(dose)) return;

    const product = await getProduct(dose.productId);
    if (!isPresent(product)) return;

    await scheduleDoseReminder(
      { id: dose.id, productName: product.name, plannedAt: dose.plannedAt },
      reminderStrings(product.name),
    );
  } catch (err) {
    log.error(`Failed to revert dose ${id}`, err);
    throw err;
  }
}

export async function snoozeDose(id: string): Promise<void> {
  log.info(`Snoozing dose ${id} by ${SNOOZE_MINUTES} min`);
  try {
    const dose = await getDoseById(id);
    if (!isPresent(dose) || !isPending(dose)) return;
    const product = await getProduct(dose.productId);
    if (!isPresent(product)) return;

    const when = new Date(Date.now() + SNOOZE_MINUTES * 60 * 1000);
    await scheduleDoseReminder(
      { id: dose.id, productName: product.name, plannedAt: when },
      reminderStrings(product.name),
    );
    await setDoseSnoozedUntil(dose.id, when);
  } catch (err) {
    log.error(`Failed to snooze dose ${id}`, err);
  }
}

export async function syncAllSchedules(): Promise<void> {
  const schedules = await getSchedules();
  log.info(`Syncing doses for ${schedules.length} schedule(s)`);
  for (const schedule of schedules) {
    await syncDosesForSchedule(schedule);
  }
}

export async function syncDosesForSchedule(schedule: Schedule): Promise<void> {
  const from = new Date();
  const product = await getProduct(schedule.productId);

  const slots =
    product?.status === 'archived'
      ? []
      : occurrencesWithin(
          schedule.intervalDays,
          schedule.timesOfDay,
          HORIZON_DAYS,
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
          reminderStrings(product.name),
        ),
      ),
    );
  } catch (err) {
    log.error(`Failed to sync doses for schedule ${schedule.id}`, err);
    throw err;
  }
}
