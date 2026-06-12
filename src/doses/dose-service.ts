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
import { nextOccurrences, type Schedule } from '@/schedules/schedule-service';

import {
  getDoseById,
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

export async function syncDosesForSchedule(schedule: Schedule): Promise<void> {
  const from = new Date();
  const product = await getProduct(schedule.productId);
  const stock = product?.stock ?? 0;

  const slots = nextOccurrences(
    schedule.intervalDays,
    schedule.timesOfDay,
    stock,
  );

  log.info(
    `Syncing ${slots.length} dose slot(s) for schedule ${schedule.id} (stock ${stock})`,
  );
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
