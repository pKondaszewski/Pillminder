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
  productDosesBetweenQuery,
  replaceFuturePendingDoseRows,
  setDoseSnoozedUntilRow,
  setDoseStateRow,
} from './dose-repository';
import { isDueInFuture, isPending } from './dose-validator';

export {
  ARC_HEIGHT,
  ARC_HORIZON_Y,
  ARC_WIDTH,
  arcPath,
  type ArcPoint,
  arcPoint,
  axisTicks,
  type DaySymbol,
  daySymbol,
  pieSlicePath,
  skyPath,
  type SkyTone,
  skyTone,
} from './day-arc';
export { type DayPhases, dayPhases } from './day-phases';
export type { CorrectionTarget } from './dose-correction';
export { correctionStockDelta } from './dose-correction';
export type { DayStatus } from './dose-day';
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
export type { DoseStatus } from './dose-status';
export { doseStatus } from './dose-status';
export type { RecentDays, StripDay } from './dose-strip';
export { buildRecentDays, recentDaysRange } from './dose-strip';
export type { TimeSlotGroup, TimeSlotLayout } from './dose-time-slot';
export { groupDosesByTimeSlot, timeSlotLayout } from './dose-time-slot';
export type { TimelineMark } from './dose-timeline';
export { buildTimeline, nowPosition } from './dose-timeline';
export { toTodayDose } from './dose-today';
export type { DayCounts, TodayCardState } from './dose-today-card';
export { BULK_TAKE_MIN_OVERDUE, todayCardState } from './dose-today-card';
export type { TodayDose } from './dto/today-dose-output';

const log = createLogger('dose-service');

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
        reminderTexts(product, quantityByScheduleId.get(dose.scheduleId) ?? 1),
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
      reminderTexts(product, await quantityForDose(dose.scheduleId)),
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
            DOSE_HORIZON_DAYS,
            schedule,
            from,
          );

    log.info(
      `Syncing ${slots.length} dose slot(s) for schedule ${schedule.id}`,
    );
    try {
      const { removedIds, inserted, kept } = await replaceFuturePendingDoseRows(
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

      const toSchedule = [
        ...inserted,
        ...kept.filter(({ plannedAt }) =>
          isWithinRetryHorizon(plannedAt, from),
        ),
      ];
      await Promise.all(
        toSchedule.map((dose) =>
          scheduleDoseReminder(
            {
              id: dose.id,
              productName: product.name,
              plannedAt: dose.plannedAt,
            },
            reminderTexts(product, schedule.quantity),
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
      reminderTexts(product, await quantityForDose(dose.scheduleId)),
    );
  } catch (err) {
    log.error(`Failed to revert dose ${id}`, err);
    throw err;
  }
}
