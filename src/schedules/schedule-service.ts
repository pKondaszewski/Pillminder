import { createLogger } from '@/config/logger';

import type { NewScheduleInput } from './dto/new-schedule-input';
import {
  createSchedule,
  deleteSchedule,
  schedulesQuery,
  updateSchedule,
  type Schedule,
} from './schedule-repository';

export { nextOccurrences, previewOccurrences } from './schedule-helper';
export type { Schedule } from './schedule-repository';

const log = createLogger('schedule-service');

export function getSchedulesQuery() {
  return schedulesQuery();
}

export async function addSchedule(input: NewScheduleInput): Promise<Schedule> {
  log.info(`Adding schedule for product ${input.productId}`);
  try {
    const created = await createSchedule(input);
    log.info(`Created schedule ${JSON.stringify(created)}`);
    return created;
  } catch (err) {
    log.error(`Failed to add schedule for product ${input.productId}`, err);
    throw err;
  }
}

export async function editSchedule(
  id: string,
  input: NewScheduleInput,
): Promise<Schedule> {
  log.info(`Updating schedule with id ${id}`);
  try {
    const updated = await updateSchedule(id, input);
    log.info(`Updated schedule ${JSON.stringify(updated)}`);
    return updated;
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
