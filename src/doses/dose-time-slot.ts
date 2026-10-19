import type {
  TimeSlot,
  TimeSlotGroup,
  TimeSlotLayout,
} from './dto/time-slot-output';
import type { TodayDose } from './dto/today-dose-output';

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
  const active = doses.filter((dose) => dose.state === 'pending');
  if (active.length === 0 && !expanded) {
    return {
      kind: 'collapsed',
      taken: doses.filter((dose) => dose.state === 'taken').length,
      skipped: doses.filter((dose) => dose.state === 'skipped').length,
    };
  }
  const overflows = active.length > SLOT_MAX_ACTIVE_DOSES;
  return {
    kind: 'list',
    visible:
      overflows && !expanded ? active.slice(0, SLOT_ACTIVE_DOSES_SHOWN) : doses,
    collapsible: active.length === 0,
    overflowCount: overflows ? doses.length : null,
  };
}

function timeSlotOf(plannedAt: Date): TimeSlot {
  const hour = plannedAt.getHours();
  return TIME_SLOTS.find(({ beforeHour }) => hour < beforeHour)!.slot;
}
