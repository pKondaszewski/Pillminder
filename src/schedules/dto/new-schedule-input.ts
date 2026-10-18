export interface NewScheduleInput {
  productId: string;
  intervalDays: number;
  timesOfDay: string[];
  quantity?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface ScheduleChange {
  intervalDays?: number;
  timesOfDay?: string[];
  quantity?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}
