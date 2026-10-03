import {
  daysBetween,
  nextOccurrences,
  occurrencesWithin,
  previewOccurrences,
} from '../schedule-helper';

const NOW = new Date(2026, 0, 10, 12, 0);

function at(month: number, day: number, hours: number, minutes = 0): Date {
  return new Date(2026, month - 1, day, hours, minutes);
}

describe('occurrencesWithin', () => {
  it('returns one dose per day for a single daily time', () => {
    // given
    const timesOfDay = ['18:00'];

    // when
    const result = occurrencesWithin(1, timesOfDay, 3, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 18), at(1, 11, 18), at(1, 12, 18)]);
  });

  it('orders several daily times chronologically within each day', () => {
    // given
    const timesOfDay = ['20:00', '08:00', '14:00'];

    // when
    const result = occurrencesWithin(1, timesOfDay, 2, {}, NOW);

    // then
    expect(result).toEqual([
      at(1, 10, 14),
      at(1, 10, 20),
      at(1, 11, 8),
      at(1, 11, 14),
      at(1, 11, 20),
    ]);
  });

  it('skips a time of day that has already passed today', () => {
    // given
    const timesOfDay = ['08:00'];

    // when
    const result = occurrencesWithin(1, timesOfDay, 2, {}, NOW);

    // then
    expect(result).toEqual([at(1, 11, 8)]);
  });

  it('includes a time of day later today', () => {
    // given
    const timesOfDay = ['13:00'];

    // when
    const result = occurrencesWithin(1, timesOfDay, 1, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 13)]);
  });

  it('includes a dose scheduled exactly at now', () => {
    // given
    const timesOfDay = ['12:00'];

    // when
    const result = occurrencesWithin(1, timesOfDay, 1, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 12)]);
  });

  it('excludes the horizon boundary (midnight, horizonDays after today)', () => {
    // given
    const timesOfDay = ['00:00', '23:59'];

    // when
    const result = occurrencesWithin(1, timesOfDay, 2, {}, NOW);

    // then
    expect(result).toEqual([
      at(1, 10, 23, 59),
      at(1, 11, 0),
      at(1, 11, 23, 59),
    ]);
  });

  it('anchors an interval above one day to today when there is no start date', () => {
    // given
    const timesOfDay = ['18:00'];

    // when
    const result = occurrencesWithin(3, timesOfDay, 10, {}, NOW);

    // then
    expect(result).toEqual([
      at(1, 10, 18),
      at(1, 13, 18),
      at(1, 16, 18),
      at(1, 19, 18),
    ]);
  });

  it('moves the anchor to tomorrow when no start date and today is already past', () => {
    // given
    const timesOfDay = ['08:00'];

    // when
    const result = occurrencesWithin(3, timesOfDay, 10, {}, NOW);

    // then
    expect(result).toEqual([at(1, 13, 8), at(1, 16, 8), at(1, 19, 8)]);
  });

  it('counts the rhythm from a past start date, also when today is not a dose day', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { startDate: at(1, 8, 0) };

    // when
    const result = occurrencesWithin(3, timesOfDay, 6, period, NOW);

    // then
    expect(result).toEqual([at(1, 11, 18), at(1, 14, 18)]);
  });

  it('keeps today when the past start date puts a dose day on today', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { startDate: at(1, 4, 0) };

    // when
    const result = occurrencesWithin(3, timesOfDay, 4, period, NOW);

    // then
    expect(result).toEqual([at(1, 10, 18), at(1, 13, 18)]);
  });

  it('starts at a future start date', () => {
    // given
    const timesOfDay = ['08:00'];
    const period = { startDate: at(1, 12, 0) };

    // when
    const result = occurrencesWithin(2, timesOfDay, 7, period, NOW);

    // then
    expect(result).toEqual([at(1, 12, 8), at(1, 14, 8), at(1, 16, 8)]);
  });

  it('generates doses on the end date and none after it', () => {
    // given
    const timesOfDay = ['08:00', '20:00'];
    const period = { endDate: at(1, 12, 0) };

    // when
    const result = occurrencesWithin(1, timesOfDay, 10, period, NOW);

    // then
    expect(result).toEqual([
      at(1, 10, 20),
      at(1, 11, 8),
      at(1, 11, 20),
      at(1, 12, 8),
      at(1, 12, 20),
    ]);
  });

  it('generates doses on the end date even when the end date has a late time', () => {
    // given
    const timesOfDay = ['08:00'];
    const period = { endDate: at(1, 11, 23, 59) };

    // when
    const result = occurrencesWithin(1, timesOfDay, 10, period, NOW);

    // then
    expect(result).toEqual([at(1, 11, 8)]);
  });

  it('returns nothing when the end date is in the past', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { endDate: at(1, 9, 0) };

    // when
    const result = occurrencesWithin(1, timesOfDay, 10, period, NOW);

    // then
    expect(result).toEqual([]);
  });

  it('returns nothing when the end date is before the start date', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { startDate: at(1, 20, 0), endDate: at(1, 15, 0) };

    // when
    const result = occurrencesWithin(1, timesOfDay, 30, period, NOW);

    // then
    expect(result).toEqual([]);
  });

  it('returns nothing for empty timesOfDay', () => {
    // given
    const timesOfDay: string[] = [];

    // when
    const result = occurrencesWithin(1, timesOfDay, 5, {}, NOW);

    // then
    expect(result).toEqual([]);
  });

  it.each([0, -1])('returns nothing for horizonDays = %i', (horizonDays) => {
    // given
    const timesOfDay = ['18:00'];

    // when
    const result = occurrencesWithin(1, timesOfDay, horizonDays, {}, NOW);

    // then
    expect(result).toEqual([]);
  });

  it.each([0, -2])('treats intervalDays = %i as daily', (intervalDays) => {
    // given
    const timesOfDay = ['18:00'];

    // when
    const result = occurrencesWithin(intervalDays, timesOfDay, 2, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 18), at(1, 11, 18)]);
  });

  describe('daylight saving time (Europe/Warsaw)', () => {
    it('runs tests in the Europe/Warsaw time zone', () => {
      // given
      const springForwardNight = new Date(2026, 2, 29, 12, 0);

      // when
      const offsetMinutes = springForwardNight.getTimezoneOffset();

      // then
      expect(offsetMinutes).toBe(-120);
    });

    it('keeps the wall-clock time and every day across spring forward (2026-03-29)', () => {
      // given
      const timesOfDay = ['08:00'];
      const now = at(3, 27, 12);

      // when
      const result = occurrencesWithin(1, timesOfDay, 5, {}, now);

      // then
      expect(result).toEqual([
        at(3, 28, 8),
        at(3, 29, 8),
        at(3, 30, 8),
        at(3, 31, 8),
      ]);
      expect(result.map((date) => date.getHours())).toEqual([8, 8, 8, 8]);
    });

    it('keeps the wall-clock time and every day across fall back (2026-10-25)', () => {
      // given
      const timesOfDay = ['08:00', '23:30'];
      const now = at(10, 23, 12);

      // when
      const result = occurrencesWithin(1, timesOfDay, 4, {}, now);

      // then
      expect(result).toEqual([
        at(10, 23, 23, 30),
        at(10, 24, 8),
        at(10, 24, 23, 30),
        at(10, 25, 8),
        at(10, 25, 23, 30),
        at(10, 26, 8),
        at(10, 26, 23, 30),
      ]);
    });

    it('keeps a 2-day rhythm from a start date before spring forward', () => {
      // given
      const timesOfDay = ['08:00'];
      const period = { startDate: at(3, 25, 0) };
      const now = at(3, 28, 12);

      // when
      const result = occurrencesWithin(2, timesOfDay, 6, period, now);

      // then
      expect(result).toEqual([at(3, 29, 8), at(3, 31, 8), at(4, 2, 8)]);
    });

    it('keeps a 2-day rhythm from a start date before fall back', () => {
      // given
      const timesOfDay = ['08:00'];
      const period = { startDate: at(10, 21, 0) };
      const now = at(10, 25, 12);

      // when
      const result = occurrencesWithin(2, timesOfDay, 5, period, now);

      // then
      expect(result).toEqual([at(10, 27, 8), at(10, 29, 8)]);
    });

    it('includes the end date when it is the spring forward day', () => {
      // given
      const timesOfDay = ['08:00'];
      const period = { endDate: at(3, 29, 0) };
      const now = at(3, 28, 12);

      // when
      const result = occurrencesWithin(1, timesOfDay, 5, period, now);

      // then
      expect(result).toEqual([at(3, 29, 8)]);
    });

    it('uses the horizon of calendar days across fall back', () => {
      // given
      const timesOfDay = ['00:00'];
      const now = at(10, 24, 12);

      // when
      const result = occurrencesWithin(1, timesOfDay, 2, {}, now);

      // then
      expect(result).toEqual([at(10, 25, 0)]);
    });
  });
});

describe('nextOccurrences', () => {
  it('returns the requested number of doses across days', () => {
    // given
    const timesOfDay = ['08:00', '20:00'];

    // when
    const result = nextOccurrences(1, timesOfDay, 3, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 20), at(1, 11, 8), at(1, 11, 20)]);
  });

  it('returns fewer doses when the period ends first', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { endDate: at(1, 11, 0) };

    // when
    const result = nextOccurrences(1, timesOfDay, 5, period, NOW);

    // then
    expect(result).toEqual([at(1, 10, 18), at(1, 11, 18)]);
  });

  it('starts at a future start date', () => {
    // given
    const timesOfDay = ['08:00'];
    const period = { startDate: at(2, 1, 0) };

    // when
    const result = nextOccurrences(7, timesOfDay, 2, period, NOW);

    // then
    expect(result).toEqual([at(2, 1, 8), at(2, 8, 8)]);
  });

  it('returns nothing for empty timesOfDay', () => {
    // given
    const timesOfDay: string[] = [];

    // when
    const result = nextOccurrences(1, timesOfDay, 3, {}, NOW);

    // then
    expect(result).toEqual([]);
  });

  it.each([0, -1])('returns nothing for count = %i', (count) => {
    // given
    const timesOfDay = ['08:00'];

    // when
    const result = nextOccurrences(1, timesOfDay, count, {}, NOW);

    // then
    expect(result).toEqual([]);
  });

  it('finds a dose far ahead for a long interval', () => {
    // given
    const timesOfDay = ['08:00'];

    // when
    const result = nextOccurrences(365, timesOfDay, 2, {}, NOW);

    // then
    expect(result).toEqual([
      new Date(2027, 0, 10, 8, 0),
      new Date(2028, 0, 10, 8, 0),
    ]);
  });
});

describe('previewOccurrences', () => {
  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(NOW);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns the next three doses from the current time', () => {
    // given
    const timesOfDay = ['08:00'];

    // when
    const result = previewOccurrences(1, timesOfDay);

    // then
    expect(result).toEqual([at(1, 11, 8), at(1, 12, 8), at(1, 13, 8)]);
  });

  it('respects the period', () => {
    // given
    const timesOfDay = ['08:00'];
    const period = { startDate: at(1, 20, 0), endDate: at(1, 21, 0) };

    // when
    const result = previewOccurrences(1, timesOfDay, period);

    // then
    expect(result).toEqual([at(1, 20, 8), at(1, 21, 8)]);
  });
});

describe('daysBetween', () => {
  it('returns whole days between two dates', () => {
    // given
    const from = at(1, 1, 0);
    const to = at(1, 8, 0);

    // when
    const days = daysBetween(from, to);

    // then
    expect(days).toBe(7);
  });

  it('counts calendar days across spring forward', () => {
    // given
    const from = at(3, 28, 0);
    const to = at(3, 30, 0);

    // when
    const days = daysBetween(from, to);

    // then
    expect(days).toBe(2);
  });

  it('counts calendar days across fall back', () => {
    // given
    const from = at(10, 24, 0);
    const to = at(10, 26, 0);

    // when
    const days = daysBetween(from, to);

    // then
    expect(days).toBe(2);
  });

  it('is negative when to is before from', () => {
    // given
    const from = at(1, 8, 0);
    const to = at(1, 5, 0);

    // when
    const days = daysBetween(from, to);

    // then
    expect(days).toBe(-3);
  });
});
