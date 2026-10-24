export interface ReorderStatus {
  daysLeft: number | null;
  runOutAt: Date | null;
  reorderAt: Date | null;
  isLow: boolean;
}
