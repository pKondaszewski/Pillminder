export interface NewScheduleInput {
  productId: string;
  intervalDays: number;
  weekdays?: number[] | null;
  timesOfDay: string[];
  quantity?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ScheduleChange {
  intervalDays?: number;
  weekdays?: number[] | null;
  timesOfDay?: string[];
  quantity?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}
