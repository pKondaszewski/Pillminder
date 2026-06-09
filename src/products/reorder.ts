import type { ReorderStatus } from './dto/reorder-status';
import type { RhythmInput } from './dto/rhythm-input';

const MS_PER_DAY = 24 * 60 * 60 * 1000;
const DEFAULT_REORDER_THRESHOLD_DAYS = 7;

export function reorderStatus(
  stock: number | null | undefined,
  schedules: RhythmInput[],
  thresholdDays: number = DEFAULT_REORDER_THRESHOLD_DAYS,
  now: Date = new Date(),
): ReorderStatus {
  const dailyConsumption = totalDailyConsumption(schedules);

  if (stock == null || dailyConsumption <= 0) {
    return { dailyConsumption, daysLeft: null, runOutAt: null, isLow: false };
  }

  const daysLeft = stock / dailyConsumption;
  const runOutAt = new Date(now.getTime() + daysLeft * MS_PER_DAY);

  return {
    dailyConsumption,
    daysLeft,
    runOutAt,
    isLow: daysLeft < thresholdDays,
  };
}

function totalDailyConsumption(schedules: RhythmInput[]): number {
  return schedules.reduce((dosesPerDay, { intervalDays, timesOfDay }) => {
    const daysBetweenDoses = Math.max(1, intervalDays);
    return dosesPerDay + timesOfDay.length / daysBetweenDoses;
  }, 0);
}
