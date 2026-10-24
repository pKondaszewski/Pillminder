import type { DoseState } from './dose-transition';
import type { AdherenceCounts } from './dto/adherence-counts';

export interface AdherenceDose {
  plannedAt: Date;
  state: DoseState;
}

export function calculateAdherence(
  doses: AdherenceDose[],
  from: Date,
  to: Date,
  now: Date,
): AdherenceCounts {
  const inRange = doses.filter(
    (dose) => dose.plannedAt >= from && dose.plannedAt < to,
  );

  return countDoses(inRange, now);
}

function countDoses(doses: AdherenceDose[], now: Date): AdherenceCounts {
  let taken = 0;
  let skipped = 0;
  let missed = 0;
  let upcoming = 0;

  for (const dose of doses) {
    if (dose.state === 'taken') taken++;
    else if (dose.state === 'skipped') skipped++;
    else if (dose.plannedAt < now) missed++;
    else upcoming++;
  }

  const due = taken + skipped + missed;
  return { taken, skipped, missed, upcoming, due };
}
