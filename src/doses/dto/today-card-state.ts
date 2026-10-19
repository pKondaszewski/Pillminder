import type { TodayDose } from './today-dose-output';

export interface DayCounts {
  total: number;
  taken: number;
  skipped: number;
  overdue: number;
  planned: number;
}

export type TodayCardState =
  | { kind: 'calm'; counts: DayCounts; next: TodayDose; untilNextMs: number }
  | {
      kind: 'overdue';
      counts: DayCounts;
      overdue: TodayDose[];
      names: string[];
      otherCount: number;
      oldestLateMs: number;
    }
  | { kind: 'done'; counts: DayCounts }
  | { kind: 'pastSummary'; counts: DayCounts }
  | { kind: 'futureSummary'; counts: DayCounts };
