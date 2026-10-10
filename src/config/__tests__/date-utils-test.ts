import { inclusiveDayRange, msUntilNextDay, startOfDay } from '../date-utils';

describe('startOfDay', () => {
  it('maps every moment of a day to the same instant', () => {
    // given
    const morning = new Date(2026, 0, 10, 0, 0, 1);
    const evening = new Date(2026, 0, 10, 23, 59, 59);

    // when
    const keys = [morning, evening].map((d) => startOfDay(d).getTime());

    // then
    expect(keys[0]).toBe(keys[1]);
    expect(keys[0]).toBe(new Date(2026, 0, 10).getTime());
  });

  it('changes after midnight', () => {
    // given
    const before = new Date(2026, 0, 10, 23, 59, 59);
    const after = new Date(2026, 0, 11, 0, 0, 0);

    // when
    const keys = [before, after].map((d) => startOfDay(d).getTime());

    // then
    expect(keys[0]).not.toBe(keys[1]);
  });
});

describe('msUntilNextDay', () => {
  it('returns the time left until the next local midnight', () => {
    // given
    const now = new Date(2026, 0, 10, 23, 0, 0);

    // when
    const delay = msUntilNextDay(now);

    // then
    expect(delay).toBe(60 * 60 * 1000);
  });

  it('returns a full day at exactly midnight', () => {
    // given
    const now = new Date(2026, 0, 10, 0, 0, 0);

    // when
    const delay = msUntilNextDay(now);

    // then
    expect(delay).toBe(24 * 60 * 60 * 1000);
  });
});

describe('inclusiveDayRange', () => {
  it('ends at the start of the day after the last day', () => {
    // given
    const first = new Date(2026, 0, 1, 15, 30);
    const last = new Date(2026, 0, 31, 8, 0);

    // when
    const range = inclusiveDayRange(first, last);

    // then
    expect(range.from).toEqual(new Date(2026, 0, 1));
    expect(range.to).toEqual(new Date(2026, 1, 1));
  });

  it('covers a single whole day when both ends are the same', () => {
    // given
    const day = new Date(2026, 5, 10, 12, 0);

    // when
    const range = inclusiveDayRange(day, day);

    // then
    expect(range.from).toEqual(new Date(2026, 5, 10));
    expect(range.to).toEqual(new Date(2026, 5, 11));
  });
});
