import { DAYS_IN_WEEK } from '@/config/calendar-grid';

import type { NewScheduleInput } from './dto/new-schedule-input';
import {
  CYCLE_UNITS,
  MAX_CYCLE_DAYS,
  type ScheduleCycle,
} from './dto/schedule-cycle';
import {
  MAX_STEP_DAYS,
  MAX_STEPS,
  MIN_STEPS,
  type ScheduleStep,
} from './dto/schedule-step';

export function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1;
}

export function isValidWeekdays(value: unknown): value is number[] {
  return (
    Array.isArray(value) &&
    value.length > 0 &&
    new Set(value).size === value.length &&
    value.every(
      (day) => Number.isInteger(day) && day >= 0 && day < DAYS_IN_WEEK,
    )
  );
}

export function isValidCycle(value: unknown): value is ScheduleCycle {
  if (typeof value !== 'object' || value === null) return false;
  const { onDays, offDays, unit } = value as Partial<ScheduleCycle>;
  return (
    isCycleLength(onDays) &&
    isCycleLength(offDays) &&
    CYCLE_UNITS.includes(unit as ScheduleCycle['unit']) &&
    (unit !== 'weeks' ||
      (onDays % DAYS_IN_WEEK === 0 && offDays % DAYS_IN_WEEK === 0))
  );
}

export function isValidSteps(value: unknown): value is ScheduleStep[] {
  return (
    Array.isArray(value) &&
    value.length >= MIN_STEPS &&
    value.length <= MAX_STEPS &&
    value.every(
      (step, index) =>
        typeof step === 'object' &&
        step !== null &&
        isPositiveInteger(step.quantity) &&
        isValidStepDays(step.days, index === value.length - 1),
    )
  );
}

export function assertValidScheduleInput(input: NewScheduleInput): void {
  if (!isPositiveInteger(input.intervalDays)) {
    throw new Error(`Invalid intervalDays: ${input.intervalDays}`);
  }
  if (input.weekdays != null && !isValidWeekdays(input.weekdays)) {
    throw new Error(`Invalid weekdays: ${JSON.stringify(input.weekdays)}`);
  }
  if (input.weekdays != null && input.intervalDays !== 1) {
    throw new Error('Weekdays cannot be combined with an interval');
  }
  if (input.cycle != null && !isValidCycle(input.cycle)) {
    throw new Error(`Invalid cycle: ${JSON.stringify(input.cycle)}`);
  }
  if (input.cycle != null && input.intervalDays !== 1) {
    throw new Error('Cycle cannot be combined with an interval');
  }
  if (input.steps != null && !isValidSteps(input.steps)) {
    throw new Error(`Invalid steps: ${JSON.stringify(input.steps)}`);
  }
  if (input.quantity !== undefined && !isPositiveInteger(input.quantity)) {
    throw new Error(`Invalid quantity: ${input.quantity}`);
  }
}

function isCycleLength(value: unknown): value is number {
  return isPositiveInteger(value) && value <= MAX_CYCLE_DAYS;
}

// Only the last step may be open-ended: it then stays until the schedule ends.
function isValidStepDays(value: unknown, isLast: boolean): boolean {
  if (value === null) return isLast;
  return isPositiveInteger(value) && value <= MAX_STEP_DAYS;
}
