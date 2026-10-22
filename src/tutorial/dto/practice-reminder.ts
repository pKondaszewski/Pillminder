import type { TodayDose } from '@/doses/dose-service';

export interface PracticeReminder {
  dose: TodayDose;
  notified: boolean;
}
