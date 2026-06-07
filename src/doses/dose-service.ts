import { createLogger } from '@/config/logger';
import { getProduct } from '@/products/product-service';
import { nextOccurrences, type Schedule } from '@/schedules/schedule-service';

import { replaceFuturePendingDoses } from './dose-repository';

const log = createLogger('dose-service');

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
