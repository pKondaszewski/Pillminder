import type { Intake } from '@/intakes/intake-service';

import type {
  TimeSlot,
  TimeSlotEntry,
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

export function groupDosesByTimeSlot(
  doses: TodayDose[],
  intakes: Intake[],
): TimeSlotGroup[] {
  const entries: TimeSlotEntry[] = [
    ...doses.map((dose): TimeSlotEntry => ({ kind: 'dose', dose })),
    ...intakes.map((intake): TimeSlotEntry => ({ kind: 'intake', intake })),
  ];
  return TIME_SLOTS.map(({ slot }) => ({
    slot,
    entries: entries
      .filter((entry) => timeSlotOf(entryTime(entry)) === slot)
      .sort(byTimeDosesFirst),
  })).filter((section) => section.entries.length > 0);
}

export function timeSlotLayout(
  entries: TimeSlotEntry[],
  expanded: boolean,
): TimeSlotLayout {
  const active = entries.filter(isPendingDose);
  if (active.length === 0 && !expanded) {
    return {
      kind: 'collapsed',
      taken: entries.filter(isTaken).length,
      skipped: entries.filter((entry) => isDoseWithState(entry, 'skipped'))
        .length,
    };
  }
  const overflows = active.length > SLOT_MAX_ACTIVE_DOSES;
  return {
    kind: 'list',
    visible:
      overflows && !expanded
        ? active.slice(0, SLOT_ACTIVE_DOSES_SHOWN)
        : entries,
    collapsible: active.length === 0,
    totalCount: overflows ? entries.length : null,
  };
}

function entryTime(entry: TimeSlotEntry): Date {
  return entry.kind === 'dose' ? entry.dose.plannedAt : entry.intake.takenAt;
}

function byTimeDosesFirst(a: TimeSlotEntry, b: TimeSlotEntry): number {
  const byTime = entryTime(a).getTime() - entryTime(b).getTime();
  if (byTime !== 0) return byTime;
  return Number(a.kind === 'intake') - Number(b.kind === 'intake');
}

function isDoseWithState(
  entry: TimeSlotEntry,
  state: TodayDose['state'],
): boolean {
  return entry.kind === 'dose' && entry.dose.state === state;
}

function isTaken(entry: TimeSlotEntry): boolean {
  return entry.kind === 'intake' || isDoseWithState(entry, 'taken');
}

function isPendingDose(entry: TimeSlotEntry): boolean {
  return isDoseWithState(entry, 'pending');
}

function timeSlotOf(time: Date): TimeSlot {
  const hour = time.getHours();
  return TIME_SLOTS.find(({ beforeHour }) => hour < beforeHour)!.slot;
}
