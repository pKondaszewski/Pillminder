import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  addSchedule,
  editSchedule,
  getSchedulesQuery,
  removeSchedule,
} from '@/schedules/schedule-service';

export function useSchedules() {
  const { data } = useLiveQuery(getSchedulesQuery());
  return { schedules: data, addSchedule, editSchedule, removeSchedule };
}
