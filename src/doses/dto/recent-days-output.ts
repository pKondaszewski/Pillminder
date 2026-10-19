import type { AdherenceCounts } from './adherence-report-output';
import type { DayStatus } from './day-status';

export interface StripDay {
  day: Date;
  status: DayStatus;
}

export interface RecentDays {
  days: StripDay[];
  counts: AdherenceCounts;
}
