import { addDays, type DateRange, startOfDay } from '@/config/date-utils';

import { type AdherenceDose, calculateAdherence } from './dose-adherence';
import { type DayStatus, dayStatus } from './dose-day';
import type { AdherenceCounts } from './dto/adherence-report-output';

export const STRIP_DAYS = 14;

export interface StripDay {
  day: Date;
  status: DayStatus;
}

export interface RecentDays {
  days: StripDay[];
  counts: AdherenceCounts;
}

export function recentDaysRange(now: Date): DateRange {
  const today = startOfDay(now);
  return { from: addDays(today, 1 - STRIP_DAYS), to: addDays(today, 1) };
}

export function buildRecentDays(doses: AdherenceDose[], now: Date): RecentDays {
  const { from, to } = recentDaysRange(now);
  const days = Array.from({ length: STRIP_DAYS }, (_, index) => {
    const day = addDays(from, index);
    return { day, status: dayStatus(day, doses, now) };
  });
  return { days, counts: calculateAdherence(doses, from, to, now).total };
}
