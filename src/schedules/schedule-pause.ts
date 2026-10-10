import { startOfDay } from '@/config/date-utils';

export interface SchedulePause {
  pausedAt?: Date | null;
  resumeAt?: Date | null;
}

// A pause with a `resumeAt` ends at the start of that day, so the resume day
// itself is already an active day.
export function isPaused(pause: SchedulePause, now: Date): boolean {
  const { pausedAt, resumeAt } = pause;
  if (!pausedAt) return false;
  const day = startOfDay(now);
  if (day < startOfDay(pausedAt)) return false;
  return !resumeAt || day < startOfDay(resumeAt);
}
