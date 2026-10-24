import type { ScheduleCycle } from './schedule-cycle';

export interface NewScheduleInput {
  productId: string;
  intervalDays: number;
  weekdays?: number[] | null;
  cycle?: ScheduleCycle | null;
  timesOfDay: string[];
  quantity?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ScheduleChange {
  intervalDays?: number;
  weekdays?: number[] | null;
  cycle?: ScheduleCycle | null;
  timesOfDay?: string[];
  quantity?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}
