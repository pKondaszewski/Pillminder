import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { syncDosesForSchedule } from '@/doses/dose-service';
import type { NewScheduleInput } from '@/schedules/dto/new-schedule-input';
import {
  addSchedule,
  editSchedule,
  getSchedulesQuery,
  removeSchedule,
} from '@/schedules/schedule-service';

export function useSchedules() {
  const { data } = useLiveQuery(getSchedulesQuery());

  const add = async (input: NewScheduleInput) => {
    const created = await addSchedule(input);
    await syncDosesForSchedule(created);
  };

  const edit = async (id: string, input: NewScheduleInput) => {
    const updated = await editSchedule(id, input);
    await syncDosesForSchedule(updated);
  };

  return {
    schedules: data,
    addSchedule: add,
    editSchedule: edit,
    removeSchedule,
  };
}
