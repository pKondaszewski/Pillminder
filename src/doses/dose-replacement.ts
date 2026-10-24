import type { Dose, NewDoseSlot } from './dose-repository';

// `slots` start at `from` (the beginning of today), so today's overdue pending
// doses are kept only while their slot is still in the schedule.
export function planPendingReplacement(
  existing: Dose[],
  slots: NewDoseSlot[],
  now: Date,
): { removedIds: string[]; newSlots: NewDoseSlot[] } {
  const wanted = new Set(slots.map((slot) => slot.plannedAt.getTime()));
  const existingTimes = new Set(
    existing.map((dose) => dose.plannedAt.getTime()),
  );

  return {
    removedIds: existing
      .filter((dose) => !wanted.has(dose.plannedAt.getTime()))
      .map((dose) => dose.id),
    newSlots: slots.filter(
      (slot) =>
        slot.plannedAt >= now && !existingTimes.has(slot.plannedAt.getTime()),
    ),
  };
}
