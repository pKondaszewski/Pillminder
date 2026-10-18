import { addDays, startOfDay } from '@/config/date-utils';

import { type AdherenceDose, calculateAdherence } from './dose-adherence';
import type { TodayDose } from './dto/today-dose-output';

export type DayStatus = 'none' | 'upcoming' | 'missed' | 'skipped' | 'allTaken';

export interface ProductDoses {
  productId: string;
  productName: string;
  doses: TodayDose[];
}

export function dayStatus(
  day: Date,
  doses: AdherenceDose[],
  now: Date,
): DayStatus {
  const from = startOfDay(day);
  const { total } = calculateAdherence(doses, from, addDays(from, 1), now);

  if (total.missed > 0) return 'missed';
  if (total.skipped > 0) return 'skipped';
  if (total.upcoming > 0) return 'upcoming';
  return total.taken > 0 ? 'allTaken' : 'none';
}

export function groupDosesByProduct(doses: TodayDose[]): ProductDoses[] {
  const groups = new Map<string, ProductDoses>();
  for (const dose of doses) {
    const group = groups.get(dose.productId) ?? {
      productId: dose.productId,
      productName: dose.productName,
      doses: [],
    };
    groups.set(dose.productId, {
      ...group,
      doses: [...group.doses, dose],
    });
  }
  return [...groups.values()];
}
