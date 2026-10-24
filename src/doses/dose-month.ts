import { calculateAdherence } from './dose-adherence';
import type { TodayDose } from './dto/today-dose-output';

export interface MonthSummary {
  taken: number;
  due: number;
  skipped: number;
  missed: number;
  throughToday: boolean;
}

export function monthSummary(
  doses: TodayDose[],
  month: Date,
  now: Date,
): MonthSummary {
  const from = new Date(month.getFullYear(), month.getMonth(), 1);
  const to = new Date(month.getFullYear(), month.getMonth() + 1, 1);
  const { taken, due, skipped, missed } = calculateAdherence(
    doses,
    from,
    to,
    now,
  );
  return { taken, due, skipped, missed, throughToday: now >= from && now < to };
}
