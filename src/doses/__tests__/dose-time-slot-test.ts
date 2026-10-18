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
    const sections = groupDosesByTimeSlot(doses);

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
    const sections = groupDosesByTimeSlot(doses);

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
    const sections = groupDosesByTimeSlot(doses);

    // then
    expect(sections.map(({ slot }) => slot)).toEqual(['evening']);
  });

  it('returns no sections when there are no doses', () => {
    // when
    const sections = groupDosesByTimeSlot([]);

    // then
    expect(sections).toEqual([]);
  });
});

describe('timeSlotLayout', () => {
  function withState(id: string, state: TodayDose['state']): TodayDose {
    return { ...doseAt(id, at(8)), state };
  }

  it('collapses a slot where every dose is handled', () => {
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

  it('lists a collapsed slot after it is expanded', () => {
    // given
    const doses = [withState('a', 'taken')];

    // when
    const layout = timeSlotLayout(doses, true);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: doses,
      showAllCount: null,
    });
  });

  it('lists every dose while one is still pending', () => {
    // given
    const doses = [withState('a', 'taken'), withState('b', 'pending')];

    // when
    const layout = timeSlotLayout(doses, false);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: doses,
      showAllCount: null,
    });
  });

  it('lists five active doses in full', () => {
    // given
    const doses = ['a', 'b', 'c', 'd', 'e'].map((id) =>
      withState(id, 'pending'),
    );

    // when
    const layout = timeSlotLayout(doses, false);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: doses,
      showAllCount: null,
    });
  });

  it('shows four active doses and the total above five', () => {
    // given
    const handled = withState('done', 'taken');
    const active = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) =>
      withState(id, 'pending'),
    );

    // when
    const layout = timeSlotLayout([handled, ...active], false);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: active.slice(0, 4),
      showAllCount: 7,
    });
  });

  it('shows everything once expanded', () => {
    // given
    const doses = ['a', 'b', 'c', 'd', 'e', 'f'].map((id) =>
      withState(id, 'pending'),
    );

    // when
    const layout = timeSlotLayout(doses, true);

    // then
    expect(layout).toEqual({
      kind: 'list',
      visible: doses,
      showAllCount: null,
    });
  });
});
