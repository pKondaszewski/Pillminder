import {
  MAX_STEP_DAYS,
  MAX_STEPS,
  MIN_STEPS,
  type ScheduleStep,
} from './dto/schedule-step';

const DEFAULT_STEP_DAYS = 7;

// A ramp-up: it never stops by itself, so enabling steps cannot end the doses.
export function defaultSteps(quantity: number): ScheduleStep[] {
  return [
    { days: DEFAULT_STEP_DAYS, quantity },
    { days: null, quantity: quantity + 1 },
  ];
}

export function canAddStep(steps: ScheduleStep[]): boolean {
  return steps.length < MAX_STEPS;
}

export function canRemoveStep(steps: ScheduleStep[]): boolean {
  return steps.length > MIN_STEPS;
}

// The new step repeats the last quantity and ends the way the taper ended.
export function addStep(steps: ScheduleStep[]): ScheduleStep[] {
  const last = steps[steps.length - 1];
  return [
    ...steps.slice(0, -1),
    { ...last, days: last.days ?? DEFAULT_STEP_DAYS },
    {
      days: last.days === null ? null : DEFAULT_STEP_DAYS,
      quantity: last.quantity,
    },
  ];
}

// Removing the last step hands its ending (stop or stay) to the one before it.
export function removeStep(
  steps: ScheduleStep[],
  index: number,
): ScheduleStep[] {
  const remaining = steps.filter((_, i) => i !== index);
  if (index !== steps.length - 1) return remaining;
  const last = remaining[remaining.length - 1];
  return [...remaining.slice(0, -1), { ...last, days: steps[index].days }];
}

export function changeStepDays(
  steps: ScheduleStep[],
  index: number,
  delta: number,
): ScheduleStep[] {
  return steps.map((step, i) =>
    i === index && step.days !== null
      ? { ...step, days: clamp(step.days + delta, 1, MAX_STEP_DAYS) }
      : step,
  );
}

export function changeStepQuantity(
  steps: ScheduleStep[],
  index: number,
  quantity: number,
): ScheduleStep[] {
  return steps.map((step, i) => (i === index ? { ...step, quantity } : step));
}

export function stopAfterLastStep(
  steps: ScheduleStep[],
  stop: boolean,
): ScheduleStep[] {
  const last = steps[steps.length - 1];
  return [
    ...steps.slice(0, -1),
    { ...last, days: stop ? DEFAULT_STEP_DAYS : null },
  ];
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
