import type { TodayDose } from './dto/today-dose-output';

export type TimeSlot = 'morning' | 'afternoon' | 'evening' | 'night';

export interface TimeSlotSection {
  slot: TimeSlot;
  data: TodayDose[];
}

const TIME_SLOTS: readonly { slot: TimeSlot; beforeHour: number }[] = [
  { slot: 'morning', beforeHour: 12 },
  { slot: 'afternoon', beforeHour: 17 },
  { slot: 'evening', beforeHour: 22 },
  { slot: 'night', beforeHour: 24 },
];

export function groupDosesByTimeSlot(doses: TodayDose[]): TimeSlotSection[] {
  return TIME_SLOTS.map(({ slot }) => ({
    slot,
    data: doses.filter((dose) => timeSlotOf(dose.plannedAt) === slot),
  })).filter((section) => section.data.length > 0);
}

function timeSlotOf(plannedAt: Date): TimeSlot {
  const hour = plannedAt.getHours();
  return TIME_SLOTS.find(({ beforeHour }) => hour < beforeHour)!.slot;
}
