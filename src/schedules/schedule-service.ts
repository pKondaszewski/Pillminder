import { createLogger } from '@/config/logger';

import type { NewScheduleInput } from './dto/new-schedule-input';
import {
  createSchedule as createScheduleRow,
  deleteSchedule as deleteScheduleRow,
  getAllSchedules,
  getSchedulesByProductId,
  schedulesQuery,
  updateSchedule as updateScheduleRow,
  type Schedule,
} from './schedule-repository';

export {
  nextOccurrences,
  occurrencesWithin,
  previewOccurrences,
} from './schedule-helper';
export type { Schedule } from './schedule-repository';

const log = createLogger('schedule-service');

export function getSchedulesQuery() {
  return schedulesQuery();
}

export function getSchedulesByProduct(productId: string): Promise<Schedule[]> {
  return getSchedulesByProductId(productId);
}

export function getSchedules(): Promise<Schedule[]> {
  return getAllSchedules();
}

export async function createSchedule(
  input: NewScheduleInput,
): Promise<Schedule> {
  log.info(`Adding schedule for product ${input.productId}`);
  try {
    const created = await createScheduleRow(input);
    log.info(`Created schedule ${JSON.stringify(created)}`);
    return created;
  } catch (err) {
    log.error(`Failed to add schedule for product ${input.productId}`, err);
    throw err;
  }
}

export async function updateSchedule(
  id: string,
  input: NewScheduleInput,
): Promise<Schedule> {
  log.info(`Updating schedule with id ${id}`);
  try {
    const updated = await updateScheduleRow(id, input);
    log.info(`Updated schedule ${JSON.stringify(updated)}`);
    return updated;
  } catch (err) {
    log.error(`Failed to update schedule with id ${id}`, err);
    throw err;
  }
}

export async function deleteSchedule(id: string): Promise<void> {
  log.info(`Deleting schedule with id ${id}`);
  try {
    await deleteScheduleRow(id);
  } catch (err) {
    log.error(`Failed to delete schedule with id ${id}`, err);
    throw err;
  }
}
