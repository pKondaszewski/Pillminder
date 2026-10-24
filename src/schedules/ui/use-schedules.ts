import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  addSchedule,
  editSchedule,
  pauseSchedule,
  removeSchedule,
  restoreSchedule,
  resumeSchedule,
} from '@/schedules/schedule-orchestrator';
import { getSchedulesQuery } from '@/schedules/schedule-service';

export function useSchedules() {
  const { data } = useLiveQuery(getSchedulesQuery());

  return {
    schedules: data,
    addSchedule,
    editSchedule,
    restoreSchedule,
    removeSchedule,
    pauseSchedule,
    resumeSchedule,
  };
}
