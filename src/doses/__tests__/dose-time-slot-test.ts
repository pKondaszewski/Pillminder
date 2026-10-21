import type { Intake } from '@/intakes/intake-service';

import { groupDosesByTimeSlot, timeSlotLayout } from '../dose-time-slot';
import type { TodayDose } from '../dto/today-dose-output';

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 10, hours, minutes);
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
      sections.map(({ slot, data }) => [slot, data.map((d) => d.id)]),
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

  it('places intakes in the slot of their time, sorted by time', () => {
    // given
    const intakes = [
      intakeAt('late', at(15)),
      intakeAt('early', at(13)),
      intakeAt('morning', at(8)),
    ];

    // when
    const sections = groupDosesByTimeSlot([doseAt('a', at(8))], intakes);

    // then
    expect(
      sections.map(({ slot, data, intakes: slotIntakes }) => [
        slot,
        data.map((d) => d.id),
        slotIntakes.map((i) => i.id),
      ]),
    ).toEqual([
      ['morning', ['a'], ['morning']],
      ['afternoon', [], ['early', 'late']],
    ]);
  });

  it('keeps a slot that has only intakes', () => {
    // when
    const sections = groupDosesByTimeSlot([], [intakeAt('i', at(19))]);

    // then
    expect(sections.map(({ slot }) => slot)).toEqual(['evening']);
  });

  it('does not change what the dose layout counts', () => {
    // given
    const doses = [doseAt('a', at(8))];

    // when
    const [section] = groupDosesByTimeSlot(doses, [intakeAt('i', at(9))]);

    // then
    expect(timeSlotLayout(section.data, false)).toEqual(
      timeSlotLayout(doses, false),
    );
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
    const layout = timeSlotLayout(doses, false);

    // then
    expect(layout).toEqual({ kind: 'collapsed', taken: 2, skipped: 1 });
  });

  it('lists a handled slot as collapsible once expanded manually', () => {
    // given
    const doses = [withState('a', 'taken')];

    // when
    const layout = timeSlotLayout(doses, true);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: doses,
      collapsible: true,
      overflowCount: null,
    });
  });

  it('keeps an expanded slot open when its last pending dose gets handled', () => {
    // given
    const before = [withState('a', 'taken'), withState('b', 'pending')];
    const after = [withState('a', 'taken'), withState('b', 'taken')];

    // when
    const duringEdit = timeSlotLayout(before, true);
    const afterEdit = timeSlotLayout(after, true);

    // then
    expect(duringEdit).toMatchObject({ kind: 'list', collapsible: false });
    expect(afterEdit).toMatchObject({ kind: 'list', collapsible: true });
  });

  it('lists every dose while one is still pending and keeps the slot not collapsible', () => {
    // given
    const doses = [withState('a', 'taken'), withState('b', 'pending')];

    // when
    const layout = timeSlotLayout(doses, false);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: doses,
      collapsible: false,
      overflowCount: null,
    });
  });

  it('lists five active doses in full', () => {
    // given
    const doses = pendingDoses(['a', 'b', 'c', 'd', 'e']);

    // when
    const layout = timeSlotLayout(doses, false);

    // then
    expect(layout).toMatchObject({
      visible: doses,
      overflowCount: null,
    });
  });

  it('shows four active doses and the total above five', () => {
    // given
    const handled = withState('done', 'taken');
    const active = pendingDoses(['a', 'b', 'c', 'd', 'e', 'f']);

    // when
    const layout = timeSlotLayout([handled, ...active], false);

    // then
    expect(layout).toMatchObject({
      kind: 'list',
      visible: active.slice(0, 4),
      overflowCount: 7,
    });
  });

  it('shows everything and offers to show less once the overflow is expanded', () => {
    // given
    const doses = pendingDoses(['a', 'b', 'c', 'd', 'e', 'f']);

    // when
    const layout = timeSlotLayout(doses, true);

    // then
    expect(layout).toMatchObject({
      visible: doses,
      overflowCount: 6,
    });
  });
});
