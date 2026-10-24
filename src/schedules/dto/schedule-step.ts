export const MIN_STEPS = 2;

export const MAX_STEPS = 10;

export const MAX_STEP_DAYS = 365;

export interface ScheduleStep {
  days: number | null;
  quantity: number;
}
