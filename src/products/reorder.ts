import { addDays, startOfDay } from '@/config/date-utils';
import { isPaused } from '@/schedules/schedule-pause';

import type { ReorderStatus } from './dto/reorder-status';
import type { RhythmInput } from './dto/rhythm-input';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_REORDER_THRESHOLD_DAYS = 7;
const MAX_SIMULATED_DAYS = 3660;

export function reorderStatus(
  stock: number | null | undefined,
  schedules: RhythmInput[],
  thresholdDays: number = DEFAULT_REORDER_THRESHOLD_DAYS,
  now: Date = new Date(),
): ReorderStatus {
  const dailyConsumption = totalDailyConsumption(schedules, now);
  const daysLeft =
    stock == null
      ? null
      : daysUntilEmpty(stock, schedules, dailyConsumption, now);

  if (daysLeft === null) {
    return {
      dailyConsumption,
      daysLeft: null,
      runOutAt: null,
      reorderAt: null,
      isLow: false,
    };
  }

  const runOutAt = new Date(now.getTime() + daysLeft * MS_PER_DAY);
  const reorderAt = new Date(runOutAt.getTime() - thresholdDays * MS_PER_DAY);

  return {
    dailyConsumption,
    daysLeft,
    runOutAt,
    reorderAt,
    isLow: daysLeft < thresholdDays,
  };
}

function daysUntilEmpty(
  stock: number,
  schedules: RhythmInput[],
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
  schedules: RhythmInput[],
  now: Date,
): number | null {
  const today = startOfDay(now);
  let remaining = stock;

  for (let day = 0; day < MAX_SIMULATED_DAYS; day++) {
    const consumption = totalDailyConsumption(schedules, addDays(today, day));
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
}: RhythmInput): boolean {
  return startDate != null || endDate != null || pausedAt != null;
}

function totalDailyConsumption(schedules: RhythmInput[], on: Date): number {
  return schedules
    .filter((schedule) => isActiveOn(schedule, on))
    .reduce((units, { intervalDays, timesOfDay, quantity = 1 }) => {
      const daysBetweenDoses = Math.max(1, intervalDays);
      return units + (timesOfDay.length * quantity) / daysBetweenDoses;
    }, 0);
}

function isActiveOn(schedule: RhythmInput, on: Date): boolean {
  const { startDate, endDate } = schedule;
  if (isPaused(schedule, on)) return false;
  const day = startOfDay(on);
  if (startDate && day < startOfDay(startDate)) return false;
  if (endDate && day > startOfDay(endDate)) return false;
  return true;
}
