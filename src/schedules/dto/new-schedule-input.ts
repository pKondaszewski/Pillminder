export interface NewScheduleInput {
  productId: string;
  intervalDays: number;
  timesOfDay: string[];
  quantity?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}
