import type { ScheduleCycle } from './schedule-cycle';
import type { ScheduleStep } from './schedule-step';

export interface NewScheduleInput {
  productId: string;
  intervalDays: number;
  weekdays?: number[] | null;
  cycle?: ScheduleCycle | null;
  timesOfDay: string[];
  quantity?: number;
  steps?: ScheduleStep[] | null;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ScheduleChange {
  intervalDays?: number;
  weekdays?: number[] | null;
  cycle?: ScheduleCycle | null;
  timesOfDay?: string[];
  quantity?: number;
  steps?: ScheduleStep[] | null;
  startDate?: Date | null;
  endDate?: Date | null;
}
