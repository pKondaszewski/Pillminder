import type { UndoableChange } from '@/config/undoable-change';

import type {
  NewScheduleInput,
  ScheduleChange,
} from './dto/new-schedule-input';
import { toScheduleInput } from './schedule-draft';
import type { Schedule } from './schedule-repository';

type SaveSchedule = (id: string, input: NewScheduleInput) => Promise<void>;

export function scheduleEditChange(
  schedule: Schedule,
  change: ScheduleChange,
  message: string,
  save: SaveSchedule,
): UndoableChange {
  return {
    message,
    apply: () => save(schedule.id, { ...toScheduleInput(schedule), ...change }),
    revert: () => save(schedule.id, toScheduleInput(schedule)),
  };
}
