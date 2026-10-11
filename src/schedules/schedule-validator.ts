import type { NewScheduleInput } from './dto/new-schedule-input';

export function isPositiveInteger(value: unknown): value is number {
  return Number.isInteger(value) && (value as number) >= 1;
}

export function assertValidScheduleInput(input: NewScheduleInput): void {
  if (!isPositiveInteger(input.intervalDays)) {
    throw new Error(`Invalid intervalDays: ${input.intervalDays}`);
  }
  if (input.quantity !== undefined && !isPositiveInteger(input.quantity)) {
    throw new Error(`Invalid quantity: ${input.quantity}`);
  }
}
