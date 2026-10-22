import type { DoseStatus } from './dose-status';
import type { TodayDose } from './today-dose-output';

export interface TimelineMark {
  id: string;
  position: number;
  status: DoseStatus;
  doses: TodayDose[];
  remaining: number;
}
