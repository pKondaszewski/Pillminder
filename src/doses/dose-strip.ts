import { addDays, type DateRange, startOfDay } from '@/config/date-utils';

import { type AdherenceDose, calculateAdherence } from './dose-adherence';
import { dayStatus } from './dose-day';
import type { RecentDays } from './dto/recent-days-output';

export const STRIP_DAYS = 14;

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
  return { days, counts: calculateAdherence(doses, from, to, now) };
}
