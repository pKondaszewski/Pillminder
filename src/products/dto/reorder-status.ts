export interface ReorderStatus {
  dailyConsumption: number;
  daysLeft: number | null;
  runOutAt: Date | null;
  isLow: boolean;
}
