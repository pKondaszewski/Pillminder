import type { Dose } from '../dose-repository';

export interface TodayDose {
  id: string;
  productName: string | null;
  quantity: number;
  plannedAt: Date;
  taken: boolean;
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
    taken: dose.state === 'taken',
    takenAt: dose.takenAt,
    snoozedUntil: dose.snoozedUntil,
  };
}
