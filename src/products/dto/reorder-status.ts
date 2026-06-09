export interface ReorderStatus {
  dailyConsumption: number;
  daysLeft: number | null;
  runOutAt: Date | null;
  reorderAt: Date | null;
  isLow: boolean;
}
