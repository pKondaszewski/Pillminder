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
