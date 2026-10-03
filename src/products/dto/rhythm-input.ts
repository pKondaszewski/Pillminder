export interface RhythmInput {
  intervalDays: number;
  timesOfDay: string[];
  quantity?: number;
  startDate?: Date | null;
  endDate?: Date | null;
}
