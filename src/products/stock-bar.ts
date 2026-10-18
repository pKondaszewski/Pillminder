import { REORDER_THRESHOLD_DAYS } from './reorder';

const FULL_BAR_DAYS = 30;

export function stockBarFill(daysLeft: number): number {
  return Math.min(1, Math.max(0, daysLeft / FULL_BAR_DAYS));
}

export function isStockBarLow(daysLeft: number): boolean {
  return daysLeft < REORDER_THRESHOLD_DAYS;
}
