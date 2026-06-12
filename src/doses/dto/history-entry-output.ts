import type { Dose } from '../dose-repository';

export type DoseHistoryStatus = 'taken' | 'skipped';

export interface HistoryEntry {
  id: string;
  plannedAt: Date;
  takenAt: Date | null;
  status: DoseHistoryStatus;
}

export function toHistoryEntry(dose: Dose): HistoryEntry {
  return {
    id: dose.id,
    plannedAt: dose.plannedAt,
    takenAt: dose.takenAt,
    status: dose.state === 'taken' ? 'taken' : 'skipped',
  };
}
