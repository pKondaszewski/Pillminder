import { createLogger } from '@/config/logger';

import type { NewScheduleInput } from './dto/new-schedule-input';
import {
  createSchedule,
  deleteSchedule,
  schedulesQuery,
  updateSchedule,
} from './schedule-repository';

const log = createLogger('schedule-service');

export function getSchedulesQuery() {
  return schedulesQuery();
}

export async function addSchedule(input: NewScheduleInput): Promise<void> {
  log.info(`Adding schedule for product ${input.productId}`);
  try {
    const created = await createSchedule(input);
    log.info(`Created schedule ${JSON.stringify(created)}`);
  } catch (err) {
    log.error(`Failed to add schedule for product ${input.productId}`, err);
    throw err;
  }
}

export async function editSchedule(
  id: string,
  input: NewScheduleInput,
): Promise<void> {
  log.info(`Updating schedule with id ${id}`);
  try {
    const updated = await updateSchedule(id, input);
    log.info(`Updated schedule ${JSON.stringify(updated)}`);
  } catch (err) {
    log.error(`Failed to update schedule with id ${id}`, err);
    throw err;
  }
}

export async function removeSchedule(id: string): Promise<void> {
  log.info(`Deleting schedule with id ${id}`);
  try {
    await deleteSchedule(id);
  } catch (err) {
    log.error(`Failed to delete schedule with id ${id}`, err);
    throw err;
  }
}
