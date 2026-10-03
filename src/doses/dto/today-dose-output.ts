import type { Dose } from '../dose-repository';
import type { DoseState } from '../dose-transition';

export interface TodayDose {
  id: string;
  productName: string | null;
  quantity: number;
  plannedAt: Date;
  state: DoseState;
  takenAt: Date | null;
  snoozedUntil: Date | null;
}

export function toTodayDose(
  dose: Dose,
  productName: string | null,
  quantity: number,
): TodayDose {
  return {
    id: dose.id,
    productName,
    quantity,
    plannedAt: dose.plannedAt,
    state: dose.state,
    takenAt: dose.takenAt,
    snoozedUntil: dose.snoozedUntil,
  };
}
