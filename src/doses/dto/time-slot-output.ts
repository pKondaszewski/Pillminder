import type { TodayDose } from './today-dose-output';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeSlotGroup {
  slot: TimeSlot;
  data: TodayDose[];
}

export type TimeSlotLayout =
  | { kind: 'collapsed'; taken: number; skipped: number }
  | {
      kind: 'list';
      visible: TodayDose[];
      collapsible: boolean;
      overflowCount: number | null;
    };
