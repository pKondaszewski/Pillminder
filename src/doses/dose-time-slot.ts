import type { TodayDose } from './dto/today-dose-output';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeSlotGroup {
  slot: TimeSlot;
  data: TodayDose[];
}

export type TimeSlotLayout =
  | { kind: 'collapsed'; taken: number; skipped: number }
  | { kind: 'list'; visible: TodayDose[]; showAllCount: number | null };

const SLOT_MAX_ACTIVE_DOSES = 5;
const SLOT_ACTIVE_DOSES_SHOWN = 4;

const TIME_SLOTS: readonly { slot: TimeSlot; beforeHour: number }[] = [
  { slot: 'morning', beforeHour: 12 },
  { slot: 'afternoon', beforeHour: 17 },
  { slot: 'evening', beforeHour: 22 },
  { slot: 'night', beforeHour: 24 },
];

export function groupDosesByTimeSlot(doses: TodayDose[]): TimeSlotGroup[] {
  return TIME_SLOTS.map(({ slot }) => ({
    slot,
    data: doses.filter((dose) => timeSlotOf(dose.plannedAt) === slot),
  })).filter((section) => section.data.length > 0);
}

export function timeSlotLayout(
  doses: TodayDose[],
  expanded: boolean,
): TimeSlotLayout {
  if (expanded) return { kind: 'list', visible: doses, showAllCount: null };

  const active = doses.filter((dose) => dose.state === 'pending');
  if (active.length === 0) {
    return {
      kind: 'collapsed',
      taken: doses.filter((dose) => dose.state === 'taken').length,
      skipped: doses.filter((dose) => dose.state === 'skipped').length,
    };
  }
  if (active.length > SLOT_MAX_ACTIVE_DOSES) {
    return {
      kind: 'list',
      visible: active.slice(0, SLOT_ACTIVE_DOSES_SHOWN),
      showAllCount: doses.length,
    };
  }
  return { kind: 'list', visible: doses, showAllCount: null };
}

function timeSlotOf(plannedAt: Date): TimeSlot {
  const hour = plannedAt.getHours();
  return TIME_SLOTS.find(({ beforeHour }) => hour < beforeHour)!.slot;
}
