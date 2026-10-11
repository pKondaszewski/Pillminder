import { groupDosesByTimeSlot } from '../dose-time-slot';
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
    snoozedUntil: null,
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
