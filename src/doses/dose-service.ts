import { createLogger } from '@/config/logger';
import { getProduct } from '@/products/product-service';
import { nextOccurrences, type Schedule } from '@/schedules/schedule-service';

import {
  replaceFuturePendingDoses,
  setDoseState,
  todaysDosesQuery,
} from './dose-repository';

export { toTodayDose } from './dto/today-dose-output';
export type { TodayDose } from './dto/today-dose-output';

const log = createLogger('dose-service');

export function getTodaysDosesQuery() {
  return todaysDosesQuery();
}

export async function takeDose(id: string): Promise<void> {
  log.info(`Marking dose ${id} as taken`);
  try {
    await setDoseState(id, 'taken');
  } catch (err) {
    log.error(`Failed to mark dose ${id} as taken`, err);
    throw err;
  }
}

export async function untakeDose(id: string): Promise<void> {
  log.info(`Reverting dose ${id} to pending`);
  try {
    await setDoseState(id, 'pending');
  } catch (err) {
    log.error(`Failed to revert dose ${id}`, err);
    throw err;
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
    await replaceFuturePendingDoses(
      schedule.id,
      from,
      slots.map((plannedAt) => ({
        productId: schedule.productId,
        scheduleId: schedule.id,
        plannedAt,
      })),
    );
  } catch (err) {
    log.error(`Failed to sync doses for schedule ${schedule.id}`, err);
    throw err;
  }
}
