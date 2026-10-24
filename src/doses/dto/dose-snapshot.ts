import type { DoseState } from '../dose-transition';

export interface DoseSnapshot {
  id: string;
  state: DoseState;
  takenAt: Date | null;
  takenQuantity: number | null;
}
