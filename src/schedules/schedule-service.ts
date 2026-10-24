import { startOfDay } from '@/config/date-utils';
import { createLogger } from '@/config/logger';

import { pausedDaysBefore } from './cycle-days';
import type { NewScheduleInput } from './dto/new-schedule-input';
import { rhythmStateOf } from './rhythm-state';
import {
  createScheduleRow,
  deleteScheduleRow,
  getAllSchedules,
  getScheduleById,
  getSchedulesByProductId,
  type Schedule,
  scheduleListQuery,
  schedulesQuery,
  setSchedulePauseRow,
  updateScheduleRow,
} from './schedule-repository';
import { assertValidScheduleInput } from './schedule-validator';

export { cycleUnitKey, daysPerUnit } from './cycle-days';
export type { CourseProgress } from './dto/course-progress';
export type { Rhythm } from './dto/rhythm';
export {
  type CycleUnit,
  MAX_CYCLE_DAYS,
  type ScheduleCycle,
} from './dto/schedule-cycle';
export type {
  ScheduleKind,
  ScheduleListFilters,
} from './dto/schedule-list-filters';
export type { ScheduleStep } from './dto/schedule-step';
export { occurrencesWithin, previewOccurrences } from './schedule-helper';
export { isPaused } from './schedule-pause';
export type { Schedule, ScheduleListItem } from './schedule-repository';
export {
  describeAmount,
  describeCourse,
  describeDays,
  describePeriod,
  describeRhythm,
} from './schedule-rhythm';
export { hasFiniteTaper, quantityOn } from './step-days';

const log = createLogger('schedule-service');

export function getSchedulesQuery() {
  return schedulesQuery();
}

export function getScheduleListQuery() {
  return scheduleListQuery();
}

export function getSchedulesByProduct(productId: string): Promise<Schedule[]> {
  return getSchedulesByProductId(productId);
}

export function getSchedule(id: string): Promise<Schedule | undefined> {
  return getScheduleById(id);
}

export function getSchedules(): Promise<Schedule[]> {
  return getAllSchedules();
}

export async function createSchedule(
  input: NewScheduleInput,
): Promise<Schedule> {
  log.info(`Adding schedule for product ${input.productId}`);
  try {
    assertValidScheduleInput(input);
    const created = await createScheduleRow(
      input,
      rhythmStateOf(input, undefined, new Date()),
    );
    log.info(`Created schedule ${created.id}`);
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
    assertValidScheduleInput(input);
    const existing = await getScheduleById(id);
    const updated = await updateScheduleRow(
      id,
      input,
      rhythmStateOf(input, existing, new Date()),
    );
    log.info(`Updated schedule ${updated.id}`);
    return updated;
  } catch (err) {
    log.error(`Failed to update schedule with id ${id}`, err);
    throw err;
  }
}

export async function suspendSchedule(
  id: string,
  resumeAt: Date | null,
): Promise<Schedule> {
  log.info(`Pausing schedule ${id}`);
  try {
    const now = new Date();
    return await setSchedulePauseRow(id, {
      pausedAt: now,
      resumeAt,
      rhythmPausedDays: await settledPausedDays(id, now),
    });
  } catch (err) {
    log.error(`Failed to pause schedule ${id}`, err);
    throw err;
  }
}

export async function reactivateSchedule(id: string): Promise<Schedule> {
  log.info(`Resuming schedule ${id}`);
  try {
    return await setSchedulePauseRow(id, {
      pausedAt: null,
      resumeAt: null,
      rhythmPausedDays: await settledPausedDays(id, new Date()),
    });
  } catch (err) {
    log.error(`Failed to resume schedule ${id}`, err);
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

// Moves the pause that is ending (or being replaced) into the rhythm's
// paused-days counter.
async function settledPausedDays(id: string, now: Date): Promise<number> {
  const schedule = await getScheduleById(id);
  if (!schedule) throw new Error(`Schedule ${id} not found`);
  return pausedDaysBefore(schedule, startOfDay(now));
}
