import type { Dose } from '../dose-repository';

export interface TodayDose {
  id: string;
  productName: string | null;
  plannedAt: Date;
  taken: boolean;
  takenAt: Date | null;
}

export function toTodayDose(dose: Dose, productName: string | null): TodayDose {
  return {
    id: dose.id,
    productName,
    plannedAt: dose.plannedAt,
    taken: dose.state === 'taken',
    takenAt: dose.takenAt,
  };
}
