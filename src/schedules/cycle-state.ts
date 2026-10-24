import { startOfDay } from '@/config/date-utils';

import type { CycleState } from './dto/cycle-state';
import type { NewScheduleInput } from './dto/new-schedule-input';
import type { Schedule } from './schedule-repository';

// The cycle and the steps count from the day they start: a new schedule from its
// start date (or today without one), an existing one from the day they were
// added. Later edits keep that day, unless the start date itself was moved,
// so changing the times does not restart them.
export function cycleStateOf(
  input: NewScheduleInput,
  existing: Schedule | undefined,
  now: Date,
): CycleState {
  if (!input.cycle && !input.steps)
    return { cycleAnchor: null, cyclePausedDays: 0 };
  const keptAnchor = existing?.cycleAnchor;
  if (existing && keptAnchor && !startDateMoved(input, existing)) {
    return {
      cycleAnchor: keptAnchor,
      cyclePausedDays: existing.cyclePausedDays,
    };
  }
  const anchor = existing && !keptAnchor ? now : (input.startDate ?? now);
  return { cycleAnchor: startOfDay(anchor), cyclePausedDays: 0 };
}

function startDateMoved(input: NewScheduleInput, existing: Schedule): boolean {
  const { startDate } = input;
  return (
    startDate != null &&
    startOfDay(startDate).getTime() !==
      (existing.startDate ? startOfDay(existing.startDate).getTime() : null)
  );
}
