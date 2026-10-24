import { startOfDay } from '@/config/date-utils';

import type { CycleState } from './dto/cycle-state';
import type { NewScheduleInput } from './dto/new-schedule-input';
import type { Schedule } from './schedule-repository';

// The cycle counts from the start date; without one, from the day the cycle was
// first set. Later edits keep that day, so changing the times does not restart it.
export function cycleStateOf(
  input: NewScheduleInput,
  existing: Schedule | undefined,
  now: Date,
): CycleState {
  if (!input.cycle) return { cycleAnchor: null, cyclePausedDays: 0 };
  return {
    cycleAnchor: startOfDay(input.startDate ?? existing?.cycleAnchor ?? now),
    cyclePausedDays: existing?.cyclePausedDays ?? 0,
  };
}
