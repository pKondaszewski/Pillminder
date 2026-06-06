import type { Schedule } from './types';

export const DEFAULT_REORDER_LEAD_TIME_DAYS = 7;

export function shouldReorder(
  stock: number | null,
  schedule: Schedule,
  leadTimeDays: number = DEFAULT_REORDER_LEAD_TIME_DAYS,
): boolean {
  if (stock === null) return false;
  return daysOfStockLeft(stock, schedule) <= leadTimeDays;
}

export function depletionDate(
  stock: number,
  schedule: Schedule,
  from: Date,
): Date | null {
  const days = daysOfStockLeft(stock, schedule);
  if (!Number.isFinite(days)) return null;
  const out = new Date(from);
  out.setDate(out.getDate() + Math.floor(days));
  return out;
}

export function daysOfStockLeft(stock: number, schedule: Schedule): number {
  const perDay = dosesPerDay(schedule);
  if (perDay <= 0) return Infinity;
  return stock / perDay;
}

export function dosesPerDay(schedule: Schedule): number {
  const interval = Math.max(1, Math.floor(schedule.intervalDays));
  return schedule.timesOfDay.length / interval;
}
