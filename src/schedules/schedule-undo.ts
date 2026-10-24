import type { UndoableChange } from '@/config/undoable-change';

import type {
  NewScheduleInput,
  ScheduleChange,
} from './dto/new-schedule-input';
import { toScheduleInput } from './schedule-draft';
import type { Schedule } from './schedule-repository';

type SaveSchedule = (id: string, input: NewScheduleInput) => Promise<void>;
type RestoreSchedule = (snapshot: Schedule) => Promise<void>;

export function scheduleEditChange(
  schedule: Schedule,
  change: ScheduleChange,
  message: string,
  { save, restore }: { save: SaveSchedule; restore: RestoreSchedule },
): UndoableChange {
  return {
    message,
    apply: () => save(schedule.id, { ...toScheduleInput(schedule), ...change }),
    revert: () => restore(schedule),
  };
}
