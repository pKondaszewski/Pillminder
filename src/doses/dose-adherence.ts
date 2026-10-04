import type { DoseState } from './dose-transition';
import type {
  AdherenceCounts,
  AdherenceReport,
} from './dto/adherence-report-output';

export interface AdherenceDose {
  productId: string;
  plannedAt: Date;
  state: DoseState;
}

export function calculateAdherence(
  doses: AdherenceDose[],
  from: Date,
  to: Date,
  now: Date,
): AdherenceReport {
  const inRange = doses.filter(
    (dose) => dose.plannedAt >= from && dose.plannedAt < to,
  );

  const byProduct: Record<string, AdherenceCounts> = {};
  for (const [productId, productDoses] of groupByProduct(inRange)) {
    byProduct[productId] = countDoses(productDoses, now);
  }

  return { total: countDoses(inRange, now), byProduct };
}

function groupByProduct(doses: AdherenceDose[]): Map<string, AdherenceDose[]> {
  const groups = new Map<string, AdherenceDose[]>();
  for (const dose of doses) {
    groups.set(dose.productId, [...(groups.get(dose.productId) ?? []), dose]);
  }
  return groups;
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
  return {
    taken,
    skipped,
    missed,
    upcoming,
    due,
    rate: due === 0 ? null : taken / due,
  };
}
