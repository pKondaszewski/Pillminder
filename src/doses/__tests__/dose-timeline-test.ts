import { buildTimeline, nowPosition } from '../dose-timeline';
import type { TodayDose } from '../dto/today-dose-output';

const NOW = new Date(2026, 9, 10, 12, 0);

function dose(
  id: string,
  plannedAt: Date,
  state: TodayDose['state'] = 'pending',
): TodayDose {
  return {
    id,
    productId: 'ibuprofen',
    productName: 'Ibuprofen',
    quantity: 1,
    unit: 'tablet',
    plannedAt,
    state,
    takenAt: null,
    takenQuantity: null,
    snoozedUntil: null,
    category: 'medication',
    fasting: false,
    profileImageFileName: null,
    stockTracked: true,
  };
}

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 10, hours, minutes);
}

describe('buildTimeline', () => {
  it('places one mark per dose on the 06-24 axis in its status', () => {
    // given
    const doses = [
      dose('a', at(6), 'taken'),
      dose('b', at(15), 'skipped'),
      dose('c', at(20)),
    ];

    // when
    const marks = buildTimeline(doses, NOW);

    // then
    expect(marks).toEqual([
      { id: 'a', position: 0, statuses: ['taken'], count: null },
      { id: 'b', position: 0.5, statuses: ['skipped'], count: null },
      { id: 'c', position: 14 / 18, statuses: ['planned'], count: null },
    ]);
  });

  it('merges doses less than an hour apart into slices in time order', () => {
    // given
    const doses = [dose('late', at(8, 45)), dose('early', at(8, 0), 'taken')];

    // when
    const marks = buildTimeline(doses, NOW);

    // then
    expect(marks).toHaveLength(1);
    expect(marks[0].statuses).toEqual(['taken', 'overdue']);
    expect(marks[0].count).toBeNull();
    expect(marks[0].position).toBeCloseTo((2 * 60 + 22.5) / (18 * 60));
  });

  it('keeps doses exactly an hour apart separate', () => {
    // given
    const doses = [dose('a', at(8)), dose('b', at(9))];

    // when
    const marks = buildTimeline(doses, NOW);

    // then
    expect(marks).toHaveLength(2);
  });

  it('chains doses where each is under an hour from the previous one', () => {
    // given
    const doses = [
      dose('a', at(8)),
      dose('b', at(8, 50)),
      dose('c', at(9, 40)),
    ];

    // when
    const marks = buildTimeline(doses, NOW);

    // then
    expect(marks).toHaveLength(1);
    expect(marks[0].statuses).toHaveLength(3);
  });

  it('shows four doses as slices', () => {
    // given
    const doses = [0, 10, 20, 30].map((minutes) =>
      dose(`d${minutes}`, at(14, minutes)),
    );

    // when
    const marks = buildTimeline(doses, NOW);

    // then
    expect(marks[0].statuses).toHaveLength(4);
    expect(marks[0].count).toBeNull();
  });

  it('shows the count and the most urgent status above four doses', () => {
    // given
    const doses = [
      dose('a', at(7, 0), 'taken'),
      dose('b', at(7, 10), 'taken'),
      dose('c', at(7, 20), 'skipped'),
      dose('d', at(7, 30), 'taken'),
      dose('e', at(7, 40), 'taken'),
    ];

    // when
    const marks = buildTimeline(doses, NOW);

    // then
    expect(marks).toEqual([
      {
        id: 'a',
        position: expect.any(Number),
        statuses: ['skipped'],
        count: 5,
      },
    ]);
  });

  it('ranks overdue above skipped and taken', () => {
    // given
    const doses = [
      dose('a', at(7, 0), 'skipped'),
      dose('b', at(7, 10), 'taken'),
      dose('c', at(7, 20)),
      dose('d', at(7, 30), 'taken'),
      dose('e', at(7, 40), 'taken'),
    ];

    // when
    const marks = buildTimeline(doses, NOW);

    // then
    expect(marks[0].statuses).toEqual(['overdue']);
  });

  it('clamps doses before 06:00 to the start of the axis', () => {
    // given
    const doses = [dose('night', at(2))];

    // when
    const marks = buildTimeline(doses, NOW);

    // then
    expect(marks[0].position).toBe(0);
  });
});

describe('nowPosition', () => {
  it('maps the current time onto the axis', () => {
    // when
    const position = nowPosition(at(15));

    // then
    expect(position).toBe(0.5);
  });
});
