import type { Rhythm } from '../dto/rhythm';
import { averageDayShare, dayShareOn, isRhythmDay } from '../rhythm-days';

const SATURDAY = 6;
const SUNDAY = 0;

describe('isRhythmDay', () => {
  it('matches the chosen weekdays regardless of the anchor', () => {
    // given
    const rhythm = { intervalDays: 1, weekdays: [SATURDAY, SUNDAY] };
    const anchor = new Date(2026, 0, 7);

    // when
    const days = [10, 11, 12].map((day) =>
      isRhythmDay(rhythm, anchor, new Date(2026, 0, day)),
    );

    // then
    expect(days).toEqual([true, true, false]);
  });

  it('counts an interval from the anchor', () => {
    // given
    const rhythm = { intervalDays: 3, weekdays: null };
    const anchor = new Date(2026, 0, 7);

    // when
    const days = [7, 8, 9, 10].map((day) =>
      isRhythmDay(rhythm, anchor, new Date(2026, 0, day)),
    );

    // then
    expect(days).toEqual([true, false, false, true]);
  });

  it('keeps counting an interval across a daylight saving change', () => {
    // given
    const rhythm = { intervalDays: 2, weekdays: null };
    const anchor = new Date(2026, 2, 27);

    // when
    const days = [27, 28, 29, 30, 31].map((day) =>
      isRhythmDay(rhythm, anchor, new Date(2026, 2, day)),
    );

    // then
    expect(days).toEqual([true, false, true, false, true]);
  });
});

describe('averageDayShare', () => {
  it.each([
    [{ intervalDays: 1, weekdays: null }, 1],
    [{ intervalDays: 4, weekdays: null }, 1 / 4],
    [{ intervalDays: 1, weekdays: [SATURDAY, SUNDAY] }, 2 / 7],
    [{ intervalDays: 1, weekdays: [SUNDAY] }, 1 / 7],
  ])('is the share of days with doses for %j', (rhythm, share) => {
    // when
    const result = averageDayShare(rhythm);

    // then
    expect(result).toBeCloseTo(share);
  });
});

describe('dayShareOn', () => {
  it('is all or nothing on a weekday rhythm', () => {
    // given
    const rhythm = { intervalDays: 1, weekdays: [SATURDAY] };

    // when
    const shares = [9, 10].map((day) =>
      dayShareOn(rhythm, new Date(2026, 0, day)),
    );

    // then
    expect(shares).toEqual([0, 1]);
  });

  it('stays averaged on an interval rhythm', () => {
    // given
    const rhythm = { intervalDays: 2, weekdays: null };

    // when
    const share = dayShareOn(rhythm, new Date(2026, 0, 9));

    // then
    expect(share).toBe(0.5);
  });
});

describe('cycle consumption', () => {
  const cycle = (onDays: number, offDays: number) =>
    ({ onDays, offDays, unit: 'days' }) as const;
  const anchor = new Date(2026, 0, 1);

  it.each([
    [cycle(21, 7), null, 0.75],
    [cycle(56, 28), null, 2 / 3],
    [cycle(7, 7), [6, 0], 1 / 7],
  ])(
    'averages the share of %j with weekdays %j to %d',
    (cycleValue, weekdays, expected) => {
      // given
      const rhythm = {
        intervalDays: 1,
        weekdays,
        cycle: cycleValue,
        rhythmAnchor: anchor,
      };

      // when
      const share = averageDayShare(rhythm);

      // then
      expect(share).toBeCloseTo(expected);
    },
  );

  it('consumes the full share on an on day and nothing on an off day', () => {
    // given
    const rhythm = {
      intervalDays: 1,
      weekdays: null,
      cycle: cycle(3, 2),
      rhythmAnchor: anchor,
    };

    // when
    const shares = [1, 3, 4, 5, 6].map((day) =>
      dayShareOn(rhythm, new Date(2026, 0, day)),
    );

    // then
    expect(shares).toEqual([1, 1, 0, 0, 1]);
  });

  it('consumes nothing on a weekday that falls in the off part', () => {
    // given
    const rhythm = {
      intervalDays: 1,
      weekdays: [6, 0],
      cycle: cycle(7, 7),
      rhythmAnchor: new Date(2026, 0, 5),
    };

    // when
    const shares = [10, 17, 24].map((day) =>
      dayShareOn(rhythm, new Date(2026, 0, day)),
    );

    // then
    expect(shares).toEqual([1, 0, 1]);
  });
});

describe('dayShareOn with steps', () => {
  const taper: Rhythm = {
    intervalDays: 1,
    weekdays: null,
    steps: [
      { days: 2, quantity: 3 },
      { days: 2, quantity: 1 },
    ],
    rhythmAnchor: new Date(2026, 0, 1),
    rhythmPausedDays: 0,
  };

  it('is 1 inside the steps and 0 after the last finite one', () => {
    // when
    const result = [1, 4, 5].map((day) =>
      dayShareOn(taper, new Date(2026, 0, day)),
    );

    // then
    expect(result).toEqual([1, 1, 0]);
  });
});
