import { buildTimeline, nowPosition } from '../dose-timeline';
import type { TodayDose } from '../dto/today-dose-output';

const NOW = new Date(2026, 9, 10, 12, 0);
const SPACING = 44 / (0.78 * 360);
const AXIS_MINUTES = 18 * 60;

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
    const marks = buildTimeline(doses, NOW, SPACING);

    // then
    expect(
      marks.map(({ id, position, status }) => ({ id, position, status })),
    ).toEqual([
      { id: 'a', position: 0, status: 'taken' },
      { id: 'b', position: 0.5, status: 'skipped' },
      { id: 'c', position: 14 / 18, status: 'planned' },
    ]);
  });

  it('groups doses closer than the spacing, in time order, at their mean', () => {
    // given
    const doses = [dose('late', at(8, 45)), dose('early', at(8, 0), 'taken')];

    // when
    const marks = buildTimeline(doses, NOW, SPACING);

    // then
    expect(marks).toHaveLength(1);
    expect(marks[0].doses.map(({ id }) => id)).toEqual(['early', 'late']);
    expect(marks[0].position).toBeCloseTo((2 * 60 + 22.5) / AXIS_MINUTES);
  });

  it('keeps doses exactly the spacing apart separate', () => {
    // given
    const doses = [dose('a', at(8)), dose('b', at(9))];

    // when
    const marks = buildTimeline(doses, NOW, 60 / AXIS_MINUTES);

    // then
    expect(marks).toHaveLength(2);
  });

  it('ranks overdue above planned, skipped and taken', () => {
    // given
    const doses = [
      dose('a', at(7, 0), 'skipped'),
      dose('b', at(7, 10), 'taken'),
      dose('c', at(7, 20)),
      dose('d', at(13, 30)),
    ];

    // when
    const marks = buildTimeline(doses, NOW, 30 / AXIS_MINUTES);

    // then
    expect(marks.map(({ status }) => status)).toEqual(['overdue', 'planned']);
  });

  it('keeps a group planned while any dose in it is still ahead', () => {
    // given
    const doses = [dose('a', at(13, 0), 'taken'), dose('b', at(13, 10))];

    // when
    const marks = buildTimeline(doses, NOW, SPACING);

    // then
    expect(marks[0].status).toBe('planned');
  });

  it('turns a fully handled group skipped if any dose was skipped', () => {
    // given
    const doses = [
      dose('a', at(8, 0), 'taken'),
      dose('b', at(8, 10), 'skipped'),
    ];

    // when
    const marks = buildTimeline(doses, NOW, SPACING);

    // then
    expect(marks[0].status).toBe('skipped');
  });

  it('clamps doses before 06:00 to the start of the axis', () => {
    // given
    const doses = [dose('night', at(2))];

    // when
    const marks = buildTimeline(doses, NOW, SPACING);

    // then
    expect(marks[0].position).toBe(0);
  });

  describe('with a busy day', () => {
    it('keeps 50 doses spread over the day readable', () => {
      // given
      const doses = Array.from({ length: 50 }, (_, index) =>
        dose(`d${index}`, at(6, Math.round((index * AXIS_MINUTES) / 50))),
      );

      // when
      const marks = buildTimeline(doses, NOW, SPACING);

      // then
      expect(marks.length).toBeLessThanOrEqual(Math.floor(1 / SPACING) + 1);
      expect(marks.reduce((sum, mark) => sum + mark.doses.length, 0)).toBe(50);
      marks.slice(1).forEach((mark, index) => {
        expect(mark.position - marks[index].position).toBeGreaterThanOrEqual(
          SPACING - 1e-9,
        );
      });
    });

    it('makes one group of 50 doses taken at the same time', () => {
      // given
      const doses = Array.from({ length: 50 }, (_, index) =>
        dose(`d${index}`, at(8), 'taken'),
      );

      // when
      const marks = buildTimeline(doses, NOW, SPACING);

      // then
      expect(marks).toHaveLength(1);
      expect(marks[0].doses).toHaveLength(50);
      expect(marks[0].status).toBe('taken');
    });

    it('does not add marks beyond the axis capacity above 50 doses', () => {
      // given
      const doses = Array.from({ length: 200 }, (_, index) =>
        dose(`d${index}`, at(6 + (index % 18), (index * 7) % 60)),
      );

      // when
      const marks = buildTimeline(doses, NOW, SPACING);

      // then
      expect(marks.length).toBeLessThanOrEqual(Math.floor(1 / SPACING) + 1);
      expect(marks.reduce((sum, mark) => sum + mark.doses.length, 0)).toBe(200);
    });
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
