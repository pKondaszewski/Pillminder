export const CYCLE_UNITS = ['days', 'weeks'] as const;

export const MAX_CYCLE_DAYS = 365;

export type CycleUnit = (typeof CYCLE_UNITS)[number];

export interface ScheduleCycle {
  onDays: number;
  offDays: number;
  unit: CycleUnit;
}
