import type { ScheduleCycle } from './schedule-cycle';
import type { ScheduleStep } from './schedule-step';

export interface Rhythm {
  intervalDays: number;
  weekdays: number[] | null;
  pausedAt?: Date | null;
  resumeAt?: Date | null;
  cycle?: ScheduleCycle | null;
  steps?: ScheduleStep[] | null;
  rhythmAnchor?: Date | null;
  rhythmPausedDays?: number;
}
