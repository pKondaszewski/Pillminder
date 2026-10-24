import type { AdherenceCounts } from './adherence-counts';
import type { DayStatus } from './day-status';

export interface StripDay {
  day: Date;
  status: DayStatus;
}

export interface RecentDays {
  days: StripDay[];
  counts: AdherenceCounts;
}
