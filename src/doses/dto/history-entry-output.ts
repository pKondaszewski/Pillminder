import type { Dose } from '../dose-repository';

export type DoseHistoryStatus = 'taken' | 'skipped';

export interface HistoryEntry {
  id: string;
  plannedAt: Date;
  takenAt: Date | null;
  occurredAt: Date;
  status: DoseHistoryStatus;
}

export function toHistoryEntries(doses: Dose[]): HistoryEntry[] {
  return doses.map(toHistoryEntry).sort(byOccurredAtDescending);
}

export function toHistoryEntry(dose: Dose): HistoryEntry {
  const taken = dose.state === 'taken';
  return {
    id: dose.id,
    plannedAt: dose.plannedAt,
    takenAt: dose.takenAt,
    occurredAt: taken && dose.takenAt ? dose.takenAt : dose.plannedAt,
    status: taken ? 'taken' : 'skipped',
  };
}

function byOccurredAtDescending(a: HistoryEntry, b: HistoryEntry): number {
  return (
    b.occurredAt.getTime() - a.occurredAt.getTime() ||
    b.plannedAt.getTime() - a.plannedAt.getTime() ||
    b.id.localeCompare(a.id)
  );
}
