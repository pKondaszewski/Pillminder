import {
  cancelFutureDosesForSchedules,
  cancelPendingReminders,
  syncDosesForSchedule,
} from '@/doses/dose-service';

import type { NewScheduleInput } from './dto/new-schedule-input';
import {
  createSchedule,
  deleteSchedule,
  reactivateSchedule,
  suspendSchedule,
  updateSchedule,
} from './schedule-service';

export async function addSchedule(input: NewScheduleInput): Promise<string> {
  const created = await createSchedule(input);
  await syncDosesForSchedule(created);
  return created.id;
}

export async function editSchedule(
  id: string,
  input: NewScheduleInput,
): Promise<void> {
  const updated = await updateSchedule(id, input);
  await syncDosesForSchedule(updated);
}

export async function pauseSchedule(
  id: string,
  resumeAt: Date | null,
): Promise<void> {
  const paused = await suspendSchedule(id, resumeAt);
  await syncDosesForSchedule(paused);
}

export async function resumeSchedule(id: string): Promise<void> {
  const resumed = await reactivateSchedule(id);
  await syncDosesForSchedule(resumed);
}

export async function removeSchedule(id: string): Promise<void> {
  await cancelPendingReminders([id]);
  await cancelFutureDosesForSchedules([id]);
  await deleteSchedule(id);
}
