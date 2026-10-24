import { daysCountedUntil } from './cycle-days';
import type { Rhythm } from './dto/rhythm';
import type { ScheduleStep } from './dto/schedule-step';

export function quantityOn(
  rhythm: Rhythm,
  flatQuantity: number,
  day: Date,
): number {
  const { steps, cycleAnchor } = rhythm;
  if (!steps || !cycleAnchor) return flatQuantity;
  return (
    stepOn(steps, daysCountedUntil(rhythm, cycleAnchor, day))?.quantity ?? 0
  );
}

// The last step had a length and has run out, so nothing is due from this day on.
export function isTaperOver(rhythm: Rhythm, day: Date): boolean {
  const { steps, cycleAnchor } = rhythm;
  if (!steps || !cycleAnchor) return false;
  return stepOn(steps, daysCountedUntil(rhythm, cycleAnchor, day)) === null;
}

export function hasFiniteTaper({ steps }: Rhythm): boolean {
  return steps != null && steps[steps.length - 1].days !== null;
}

export function totalStepDays(steps: ScheduleStep[]): number {
  return steps.reduce((total, { days }) => total + (days ?? 0), 0);
}

// Before the anchor (a start date in the future) the first step applies.
function stepOn(
  steps: ScheduleStep[],
  countedDays: number,
): ScheduleStep | null {
  let startsAt = 0;
  for (const step of steps) {
    if (step.days === null || countedDays < startsAt + step.days) return step;
    startsAt += step.days;
  }
  return null;
}
