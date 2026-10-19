import type { DoseStatus } from './dose-status';

export interface TimelineMark {
  id: string;
  position: number;
  statuses: DoseStatus[];
  count: number | null;
}
