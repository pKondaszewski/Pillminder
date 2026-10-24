import type { ScheduleCycle } from './schedule-cycle';

export interface Rhythm {
  intervalDays: number;
  weekdays: number[] | null;
  pausedAt?: Date | null;
  resumeAt?: Date | null;
  cycle?: ScheduleCycle | null;
  cycleAnchor?: Date | null;
  cyclePausedDays?: number;
}
