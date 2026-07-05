import {
  cancelFutureDosesForSchedule,
  syncDosesForSchedule,
} from '@/doses/dose-service';

import type { NewScheduleInput } from './dto/new-schedule-input';
import {
  createSchedule,
  deleteSchedule,
  updateSchedule,
} from './schedule-service';

export async function addSchedule(input: NewScheduleInput): Promise<void> {
  const created = await createSchedule(input);
  await syncDosesForSchedule(created);
}

export async function editSchedule(
  id: string,
  input: NewScheduleInput,
): Promise<void> {
  const updated = await updateSchedule(id, input);
  await syncDosesForSchedule(updated);
}

export async function removeSchedule(id: string): Promise<void> {
  await cancelFutureDosesForSchedule(id);
  await deleteSchedule(id);
}
