import type { Dose } from './dose-repository';
import type { HistoryEntry } from './dto/history-entry-output';

export function toHistoryEntries(doses: Dose[]): HistoryEntry[] {
  return doses.map(toHistoryEntry).sort(byOccurredAtDescending);
}

export function toHistoryEntry(dose: Dose): HistoryEntry {
  const taken = dose.state === 'taken';
  return {
    id: dose.id,
    plannedAt: dose.plannedAt,
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
