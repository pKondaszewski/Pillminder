export type DoseHistoryStatus = 'taken' | 'skipped';

export interface HistoryEntry {
  id: string;
  plannedAt: Date;
  occurredAt: Date;
  status: DoseHistoryStatus;
}
