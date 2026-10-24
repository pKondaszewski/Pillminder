import { addDays, MS_PER_DAY, startOfDay } from '@/config/date-utils';
import { averageDayShare, dayShareOn } from '@/schedules/rhythm-days';
import { isPaused } from '@/schedules/schedule-pause';
import type { Schedule } from '@/schedules/schedule-service';
import { isTaperOver, quantityOn } from '@/schedules/step-days';

import type { ReorderStatus } from './dto/reorder-status';

export const REORDER_THRESHOLD_DAYS = 7;
const MAX_SIMULATED_DAYS = 3660;
// A threshold episode has no known start, so it is always already due
const THRESHOLD_REORDER_AT = new Date(0);

export function reorderStatus(
  stock: number | null | undefined,
  schedules: Schedule[],
  now: Date,
): ReorderStatus {
  const dailyConsumption = totalConsumption(schedules, now, averageDayShare);
  const daysLeft =
    stock == null
      ? null
      : daysUntilEmpty(stock, schedules, dailyConsumption, now);

  if (daysLeft === null) {
    return {
      daysLeft: null,
      runOutAt: null,
      reorderAt: null,
      isLow: false,
    };
  }

  const runOutAt = new Date(now.getTime() + daysLeft * MS_PER_DAY);
  const reorderAt = new Date(
    runOutAt.getTime() - REORDER_THRESHOLD_DAYS * MS_PER_DAY,
  );

  return {
    daysLeft,
    runOutAt,
    reorderAt,
    isLow: daysLeft < REORDER_THRESHOLD_DAYS,
  };
}

export function hasActiveSchedule(schedules: Schedule[], now: Date): boolean {
  return schedules.some(
    ({ endDate, ...period }) =>
      !isPaused(period, now) &&
      !isTaperOver(period, now) &&
      (!endDate || startOfDay(now) <= startOfDay(endDate)),
  );
}

export function productReorderStatus(
  product: { stock: number | null; reorderThreshold: number | null },
  schedules: Schedule[],
  now: Date,
): ReorderStatus {
  const { stock, reorderThreshold } = product;
  if (
    hasActiveSchedule(schedules, now) ||
    stock === null ||
    reorderThreshold === null
  ) {
    return reorderStatus(stock, schedules, now);
  }

  const isLow = stock <= reorderThreshold;
  return {
    daysLeft: null,
    runOutAt: null,
    reorderAt: isLow ? THRESHOLD_REORDER_AT : null,
    isLow,
  };
}

export function consumptionBetween(
  schedules: Schedule[],
  firstDay: Date,
  lastDay: Date,
): number {
  let units = 0;
  for (
    let day = startOfDay(firstDay);
    day <= startOfDay(lastDay);
    day = addDays(day, 1)
  ) {
    units += totalConsumption(schedules, day, dayShareOn);
  }
  return units;
}

function daysUntilEmpty(
  stock: number,
  schedules: Schedule[],
  currentDailyConsumption: number,
  now: Date,
): number | null {
  if (!schedules.some(changesOverTime)) {
    return currentDailyConsumption > 0 ? stock / currentDailyConsumption : null;
  }
  return simulateDaysUntilEmpty(stock, schedules, now);
}

// Walks day by day so a schedule that has not started yet, that ends before
// the stock does, or that is paused, is counted only for the days it is active.
function simulateDaysUntilEmpty(
  stock: number,
  schedules: Schedule[],
  now: Date,
): number | null {
  const today = startOfDay(now);
  let remaining = stock;

  for (let day = 0; day < MAX_SIMULATED_DAYS; day++) {
    const consumption = totalConsumption(
      schedules,
      addDays(today, day),
      dayShareOn,
    );
    if (consumption <= 0) continue;
    if (remaining <= consumption) return day + remaining / consumption;
    remaining -= consumption;
  }
  return null;
}

function changesOverTime({
  startDate,
  endDate,
  pausedAt,
  weekdays,
  cycle,
  steps,
}: Schedule): boolean {
  return (
    startDate != null ||
    endDate != null ||
    pausedAt != null ||
    weekdays != null ||
    cycle != null ||
    steps != null
  );
}

function totalConsumption(
  schedules: Schedule[],
  on: Date,
  dayShare: (schedule: Schedule, day: Date) => number,
): number {
  return schedules
    .filter((schedule) => isActiveOn(schedule, on))
    .reduce(
      (units, schedule) =>
        units +
        schedule.timesOfDay.length *
          quantityOn(schedule, schedule.quantity, on) *
          dayShare(schedule, on),
      0,
    );
}

function isActiveOn(schedule: Schedule, on: Date): boolean {
  const { startDate, endDate } = schedule;
  if (isPaused(schedule, on)) return false;
  const day = startOfDay(on);
  if (startDate && day < startOfDay(startDate)) return false;
  if (endDate && day > startOfDay(endDate)) return false;
  return true;
}
