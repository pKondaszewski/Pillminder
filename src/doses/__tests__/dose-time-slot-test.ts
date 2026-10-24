import type { Intake } from '@/intakes/intake-service';

import { groupDosesByTimeSlot, timeSlotLayout } from '../dose-time-slot';
import type { TimeSlotEntry } from '../dto/time-slot-output';
import type { TodayDose } from '../dto/today-dose-output';

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 10, hours, minutes);
}

function entriesOf(doses: TodayDose[]): TimeSlotEntry[] {
  return doses.map((dose) => ({ kind: 'dose', dose }));
}

function entryIds(entries: TimeSlotEntry[]): string[] {
  return entries.map((entry) =>
    entry.kind === 'dose' ? entry.dose.id : entry.intake.id,
  );
}

function doseAt(id: string, plannedAt: Date): TodayDose {
  return {
    id,
    productId: 'ibuprofen',
    productName: 'Ibuprofen',
    quantity: 1,
    unit: 'tablet',
    plannedAt,
    state: 'pending',
    takenAt: null,
    takenQuantity: null,
    snoozedUntil: null,
    category: 'medication',
    fasting: false,
    profileImageFileName: null,
    stockTracked: true,
  };
}

function intakeAt(id: string, takenAt: Date): Intake {
  return {
    id,
    productId: 'p',
    takenAt,
    quantity: 1,
    productName: 'Ibuprofen',
    category: 'medication',
    unit: null,
    profileImageFileName: null,
  };
}

function intake(): Intake {
  return intakeAt('i', at(8));
}

describe('groupDosesByTimeSlot slot boundaries', () => {
  it.each([
    [0, 0, 'morning'],
    [2, 0, 'morning'],
    [11, 59, 'morning'],
    [12, 0, 'afternoon'],
    [16, 59, 'afternoon'],
    [17, 0, 'evening'],
    [21, 59, 'evening'],
    [22, 0, 'night'],
    [23, 59, 'night'],
  ])('puts %i:%i into %s', (hours, minutes, expected) => {
    // given
    const doses = [doseAt('a', at(hours, minutes))];

    // when
    const sections = groupDosesByTimeSlot(doses, []);

    // then
    expect(sections.map(({ slot }) => slot)).toEqual([expected]);
  });
});

describe('groupDosesByTimeSlot', () => {
  it('groups doses in chronological slot order and keeps the order within a slot', () => {
    // given
    const doses = [
      doseAt('a', at(8)),
      doseAt('b', at(9)),
      doseAt('c', at(13)),
      doseAt('d', at(23)),
    ];

    // when
    const sections = groupDosesByTimeSlot(doses, []);

    // then
    expect(
      sections.map(({ slot, entries }) => [slot, entryIds(entries)]),
    ).toEqual([
      ['morning', ['a', 'b']],
      ['afternoon', ['c']],
      ['night', ['d']],
    ]);
  });

  it('skips empty slots', () => {
    // given
    const doses = [doseAt('a', at(18))];

    // when
    const sections = groupDosesByTimeSlot(doses, []);

    // then
    expect(sections.map(({ slot }) => slot)).toEqual(['evening']);
  });

  it('returns no sections when there are no doses', () => {
    // when
    const sections = groupDosesByTimeSlot([], []);

    // then
    expect(sections).toEqual([]);
  });
});

describe('groupDosesByTimeSlot with as-needed intakes', () => {
  it('merges doses and intakes of a slot by time, a dose first on a tie', () => {
    // given
    const doses = [doseAt('dose-8', at(8)), doseAt('dose-10', at(10))];
    const intakes = [
      intakeAt('intake-10', at(10)),
      intakeAt('intake-9', at(9)),
      intakeAt('intake-15', at(15)),
    ];

    // when
    const sections = groupDosesByTimeSlot(doses, intakes);

    // then
    expect(
      sections.map(({ slot, entries }) => [slot, entryIds(entries)]),
    ).toEqual([
      ['morning', ['dose-8', 'intake-9', 'dose-10', 'intake-10']],
      ['afternoon', ['intake-15']],
    ]);
  });

  it('keeps a slot that has only intakes', () => {
    // when
    const sections = groupDosesByTimeSlot([], [intakeAt('i', at(19))]);

    // then
    expect(sections.map(({ slot }) => slot)).toEqual(['evening']);
  });
});

describe('timeSlotLayout', () => {
  function withState(id: string, state: TodayDose['state']): TodayDose {
    return { ...doseAt(id, at(8)), state };
  }

  function pendingDoses(ids: string[]): TodayDose[] {
    return ids.map((id) => withState(id, 'pending'));
  }

  it('collapses a slot where every dose is handled unless expanded', () => {
    // given
    const doses = [
      withState('a', 'taken'),
      withState('b', 'taken'),
      withState('c', 'skipped'),
    ];

    // when
    const layout = timeSlotLayout(entriesOf(doses), false);

    // then
    expect(layout).toEqual({ kind: 'collapsed', taken: 2, skipped: 1 });
  });

  it('lists a handled slot as collapsible once expanded manually', () => {
    // given
    const doses = [withState('a', 'taken')];

    // when
    const layout = timeSlotLayout(entriesOf(doses), true);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: entriesOf(doses),
      collapsible: true,
      totalCount: null,
    });
  });

  it('keeps an expanded slot open when its last pending dose gets handled', () => {
    // given
    const before = [withState('a', 'taken'), withState('b', 'pending')];
    const after = [withState('a', 'taken'), withState('b', 'taken')];

    // when
    const duringEdit = timeSlotLayout(entriesOf(before), true);
    const afterEdit = timeSlotLayout(entriesOf(after), true);

    // then
    expect(duringEdit).toMatchObject({ kind: 'list', collapsible: false });
    expect(afterEdit).toMatchObject({ kind: 'list', collapsible: true });
  });

  it('lists every dose while one is still pending and keeps the slot not collapsible', () => {
    // given
    const doses = [withState('a', 'taken'), withState('b', 'pending')];

    // when
    const layout = timeSlotLayout(entriesOf(doses), false);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: entriesOf(doses),
      collapsible: false,
      totalCount: null,
    });
  });

  it('lists five active doses in full', () => {
    // given
    const doses = pendingDoses(['a', 'b', 'c', 'd', 'e']);

    // when
    const layout = timeSlotLayout(entriesOf(doses), false);

    // then
    expect(layout).toMatchObject({
      visible: entriesOf(doses),
      totalCount: null,
    });
  });

  it('shows four active doses and the total above five', () => {
    // given
    const handled = withState('done', 'taken');
    const active = pendingDoses(['a', 'b', 'c', 'd', 'e', 'f']);

    // when
    const layout = timeSlotLayout(entriesOf([handled, ...active]), false);

    // then
    expect(layout).toMatchObject({
      kind: 'list',
      visible: entriesOf(active.slice(0, 4)),
      totalCount: 7,
    });
  });

  it('shows everything and offers to show less once the overflow is expanded', () => {
    // given
    const doses = pendingDoses(['a', 'b', 'c', 'd', 'e', 'f']);

    // when
    const layout = timeSlotLayout(entriesOf(doses), true);

    // then
    expect(layout).toMatchObject({
      visible: entriesOf(doses),
      totalCount: 6,
    });
  });

  it('counts an intake as taken in a collapsed summary', () => {
    // given
    const entries: TimeSlotEntry[] = [
      ...entriesOf([withState('a', 'skipped')]),
      { kind: 'intake', intake: intake() },
    ];

    // when
    const layout = timeSlotLayout(entries, false);

    // then
    expect(layout).toEqual({ kind: 'collapsed', taken: 1, skipped: 1 });
  });

  it('collapses a slot with only intakes and lists it as collapsible once expanded', () => {
    // given
    const entries: TimeSlotEntry[] = [{ kind: 'intake', intake: intake() }];

    // when
    const collapsed = timeSlotLayout(entries, false);
    const expanded = timeSlotLayout(entries, true);

    // then
    expect(collapsed).toEqual({ kind: 'collapsed', taken: 1, skipped: 0 });
    expect(expanded).toEqual({
      kind: 'list',
      visible: entries,
      collapsible: true,
      totalCount: null,
    });
  });

  it('keeps intakes visible next to a pending dose', () => {
    // given
    const entries: TimeSlotEntry[] = [
      { kind: 'intake', intake: intake() },
      ...entriesOf(pendingDoses(['a'])),
    ];

    // when
    const layout = timeSlotLayout(entries, false);

    // then
    expect(layout).toMatchObject({ visible: entries, collapsible: false });
  });

  it('counts intakes in the overflow total and hides them while limited', () => {
    // given
    const entries: TimeSlotEntry[] = [
      { kind: 'intake', intake: intake() },
      ...entriesOf(pendingDoses(['a', 'b', 'c', 'd', 'e', 'f'])),
    ];

    // when
    const layout = timeSlotLayout(entries, false);

    // then
    expect(layout).toMatchObject({
      visible: entries.slice(1, 5),
      totalCount: 7,
    });
  });
});
