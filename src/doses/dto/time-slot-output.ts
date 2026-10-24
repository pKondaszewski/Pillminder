import type { Intake } from '@/intakes/intake-service';

import type { TodayDose } from './today-dose-output';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export type TimeSlotEntry =
  | { kind: 'dose'; dose: TodayDose }
  | { kind: 'intake'; intake: Intake };

export interface TimeSlotGroup {
  slot: TimeSlot;
  entries: TimeSlotEntry[];
}

export type TimeSlotLayout =
  | { kind: 'collapsed'; taken: number; skipped: number }
  | {
      kind: 'list';
      visible: TimeSlotEntry[];
      collapsible: boolean;
      totalCount: number | null;
    };
