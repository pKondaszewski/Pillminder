import { startOfDay } from '@/config/date-utils';

import type { NewScheduleInput } from './dto/new-schedule-input';
import type { RhythmState } from './dto/rhythm-state';
import type { Schedule } from './schedule-repository';

// The cycle and the steps count from the day they start: a new schedule from its
// start date (or today without one), an existing one from the day they were
// added. Later edits keep that day, unless the start date itself was moved,
// so changing the times does not restart them.
export function rhythmStateOf(
  input: NewScheduleInput,
  existing: Schedule | undefined,
  now: Date,
): RhythmState {
  if (!input.cycle && !input.steps)
    return { rhythmAnchor: null, rhythmPausedDays: 0 };
  const keptAnchor = existing?.rhythmAnchor;
  if (existing && keptAnchor && !startDateMoved(input, existing)) {
    return {
      rhythmAnchor: keptAnchor,
      rhythmPausedDays: existing.rhythmPausedDays,
    };
  }
  const anchor = existing && !keptAnchor ? now : (input.startDate ?? now);
  return { rhythmAnchor: startOfDay(anchor), rhythmPausedDays: 0 };
}

function startDateMoved(input: NewScheduleInput, existing: Schedule): boolean {
  const { startDate } = input;
  return (
    startDate != null &&
    startOfDay(startDate).getTime() !==
      (existing.startDate ? startOfDay(existing.startDate).getTime() : null)
  );
}
