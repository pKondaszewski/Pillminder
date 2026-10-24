import type { Rhythm } from '../dto/rhythm';
import {
  nextOccurrences,
  occurrencesWithin,
  previewOccurrences,
} from '../schedule-helper';

const every = (intervalDays: number): Rhythm => ({
  intervalDays,
  weekdays: null,
});
const NOW = new Date(2026, 0, 10, 12, 0);

function at(month: number, day: number, hours: number, minutes = 0): Date {
  return new Date(2026, month - 1, day, hours, minutes);
}

describe('occurrencesWithin', () => {
  it('returns one dose per day for a single daily time', () => {
    // given
    const timesOfDay = ['18:00'];

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 3, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 18), at(1, 11, 18), at(1, 12, 18)]);
  });

  it('orders several daily times chronologically within each day', () => {
    // given
    const timesOfDay = ['20:00', '08:00', '14:00'];

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 2, {}, NOW);

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
    const result = occurrencesWithin(every(1), timesOfDay, 2, {}, NOW);

    // then
    expect(result).toEqual([at(1, 11, 8)]);
  });

  it('includes a time of day later today', () => {
    // given
    const timesOfDay = ['13:00'];

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 1, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 13)]);
  });

  it('includes a dose scheduled exactly at now', () => {
    // given
    const timesOfDay = ['12:00'];

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 1, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 12)]);
  });

  it('excludes the horizon boundary (midnight, horizonDays after today)', () => {
    // given
    const timesOfDay = ['00:00', '23:59'];

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 2, {}, NOW);

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
    const result = occurrencesWithin(every(3), timesOfDay, 10, {}, NOW);

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
    const result = occurrencesWithin(every(3), timesOfDay, 10, {}, NOW);

    // then
    expect(result).toEqual([at(1, 13, 8), at(1, 16, 8), at(1, 19, 8)]);
  });

  it('counts the rhythm from a past start date, also when today is not a dose day', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { startDate: at(1, 8, 0) };

    // when
    const result = occurrencesWithin(every(3), timesOfDay, 6, period, NOW);

    // then
    expect(result).toEqual([at(1, 11, 18), at(1, 14, 18)]);
  });

  it('keeps today when the past start date puts a dose day on today', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { startDate: at(1, 4, 0) };

    // when
    const result = occurrencesWithin(every(3), timesOfDay, 4, period, NOW);

    // then
    expect(result).toEqual([at(1, 10, 18), at(1, 13, 18)]);
  });

  it('starts at a future start date', () => {
    // given
    const timesOfDay = ['08:00'];
    const period = { startDate: at(1, 12, 0) };

    // when
    const result = occurrencesWithin(every(2), timesOfDay, 7, period, NOW);

    // then
    expect(result).toEqual([at(1, 12, 8), at(1, 14, 8), at(1, 16, 8)]);
  });

  it('generates doses on the end date and none after it', () => {
    // given
    const timesOfDay = ['08:00', '20:00'];
    const period = { endDate: at(1, 12, 0) };

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 10, period, NOW);

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
    const result = occurrencesWithin(every(1), timesOfDay, 10, period, NOW);

    // then
    expect(result).toEqual([at(1, 11, 8)]);
  });

  it('returns nothing when the end date is in the past', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { endDate: at(1, 9, 0) };

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 10, period, NOW);

    // then
    expect(result).toEqual([]);
  });

  it('returns nothing when the end date is before the start date', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { startDate: at(1, 20, 0), endDate: at(1, 15, 0) };

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 30, period, NOW);

    // then
    expect(result).toEqual([]);
  });

  it('returns nothing for empty timesOfDay', () => {
    // given
    const timesOfDay: string[] = [];

    // when
    const result = occurrencesWithin(every(1), timesOfDay, 5, {}, NOW);

    // then
    expect(result).toEqual([]);
  });

  it.each([0, -1])('returns nothing for horizonDays = %i', (horizonDays) => {
    // given
    const timesOfDay = ['18:00'];

    // when
    const result = occurrencesWithin(
      every(1),
      timesOfDay,
      horizonDays,
      {},
      NOW,
    );

    // then
    expect(result).toEqual([]);
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
      const result = occurrencesWithin(every(1), timesOfDay, 5, {}, now);

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
      const result = occurrencesWithin(every(1), timesOfDay, 4, {}, now);

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
      const result = occurrencesWithin(every(2), timesOfDay, 6, period, now);

      // then
      expect(result).toEqual([at(3, 29, 8), at(3, 31, 8), at(4, 2, 8)]);
    });

    it('keeps a 2-day rhythm from a start date before fall back', () => {
      // given
      const timesOfDay = ['08:00'];
      const period = { startDate: at(10, 21, 0) };
      const now = at(10, 25, 12);

      // when
      const result = occurrencesWithin(every(2), timesOfDay, 5, period, now);

      // then
      expect(result).toEqual([at(10, 27, 8), at(10, 29, 8)]);
    });

    it('includes the end date when it is the spring forward day', () => {
      // given
      const timesOfDay = ['08:00'];
      const period = { endDate: at(3, 29, 0) };
      const now = at(3, 28, 12);

      // when
      const result = occurrencesWithin(every(1), timesOfDay, 5, period, now);

      // then
      expect(result).toEqual([at(3, 29, 8)]);
    });

    it('uses the horizon of calendar days across fall back', () => {
      // given
      const timesOfDay = ['00:00'];
      const now = at(10, 24, 12);

      // when
      const result = occurrencesWithin(every(1), timesOfDay, 2, {}, now);

      // then
      expect(result).toEqual([at(10, 25, 0)]);
    });

    it('moves a time inside the spring forward gap to the first valid instant', () => {
      // given
      const timesOfDay = ['02:30'];
      const now = at(3, 28, 12);

      // when
      const result = occurrencesWithin(every(1), timesOfDay, 3, {}, now);

      // then
      expect(result).toEqual([at(3, 29, 3, 30), at(3, 30, 2, 30)]);
    });

    it('does not duplicate two times that collapse into the same instant', () => {
      // given
      const timesOfDay = ['02:30', '03:30'];
      const now = at(3, 29, 0);

      // when
      const result = occurrencesWithin(every(1), timesOfDay, 1, {}, now);

      // then
      expect(result).toEqual([at(3, 29, 3, 30)]);
    });

    it('generates a single dose for the repeated hour on fall back day', () => {
      // given
      const timesOfDay = ['02:30'];
      const now = at(10, 24, 12);

      // when
      const result = occurrencesWithin(every(1), timesOfDay, 3, {}, now);

      // then
      expect(result).toEqual([at(10, 25, 2, 30), at(10, 26, 2, 30)]);
    });
  });

  describe('while paused', () => {
    it('has no slots when paused without a resume date', () => {
      // given
      const period = { pausedAt: at(1, 9, 8), resumeAt: null };

      // when
      const result = occurrencesWithin(every(1), ['08:00'], 3, period, NOW);

      // then
      expect(result).toEqual([]);
    });

    it('has no slots before the resume day and normal slots from it', () => {
      // given
      const period = { pausedAt: at(1, 9, 8), resumeAt: at(1, 12, 0) };

      // when
      const result = occurrencesWithin(every(1), ['08:00'], 3, period, NOW);

      // then
      expect(result).toEqual([at(1, 12, 8), at(1, 13, 8), at(1, 14, 8)]);
    });

    it('counts the horizon from the resume day when it is far away', () => {
      // given
      const period = { pausedAt: at(1, 9, 8), resumeAt: at(2, 1, 0) };

      // when
      const result = occurrencesWithin(every(1), ['08:00'], 2, period, NOW);

      // then
      expect(result).toEqual([at(2, 1, 8), at(2, 2, 8)]);
    });

    it('anchors an every-N-days rhythm without a start date to the resume day', () => {
      // given
      const period = { pausedAt: at(1, 9, 8), resumeAt: at(1, 15, 0) };

      // when
      const result = occurrencesWithin(every(3), ['08:00'], 7, period, NOW);

      // then
      expect(result).toEqual([at(1, 15, 8), at(1, 18, 8), at(1, 21, 8)]);
    });

    it('keeps the phase of an every-N-days rhythm that has a start date', () => {
      // given
      const period = {
        startDate: at(1, 1, 0),
        pausedAt: at(1, 9, 8),
        resumeAt: at(1, 15, 0),
      };

      // when
      const result = occurrencesWithin(every(3), ['08:00'], 7, period, NOW);

      // then
      expect(result).toEqual([at(1, 16, 8), at(1, 19, 8)]);
    });

    it('ignores a pause whose resume date has passed', () => {
      // given
      const period = { pausedAt: at(1, 1, 8), resumeAt: at(1, 5, 0) };

      // when
      const result = occurrencesWithin(every(1), ['08:00'], 3, period, NOW);

      // then
      expect(result).toEqual([at(1, 11, 8), at(1, 12, 8)]);
    });
  });
});

describe('nextOccurrences', () => {
  it('returns the requested number of doses across days', () => {
    // given
    const timesOfDay = ['08:00', '20:00'];

    // when
    const result = nextOccurrences(every(1), timesOfDay, 3, {}, NOW);

    // then
    expect(result).toEqual([at(1, 10, 20), at(1, 11, 8), at(1, 11, 20)]);
  });

  it('returns fewer doses when the period ends first', () => {
    // given
    const timesOfDay = ['18:00'];
    const period = { endDate: at(1, 11, 0) };

    // when
    const result = nextOccurrences(every(1), timesOfDay, 5, period, NOW);

    // then
    expect(result).toEqual([at(1, 10, 18), at(1, 11, 18)]);
  });

  it('starts at a future start date', () => {
    // given
    const timesOfDay = ['08:00'];
    const period = { startDate: at(2, 1, 0) };

    // when
    const result = nextOccurrences(every(7), timesOfDay, 2, period, NOW);

    // then
    expect(result).toEqual([at(2, 1, 8), at(2, 8, 8)]);
  });

  it('returns nothing for empty timesOfDay', () => {
    // given
    const timesOfDay: string[] = [];

    // when
    const result = nextOccurrences(every(1), timesOfDay, 3, {}, NOW);

    // then
    expect(result).toEqual([]);
  });

  it.each([0, -1])('returns nothing for count = %i', (count) => {
    // given
    const timesOfDay = ['08:00'];

    // when
    const result = nextOccurrences(every(1), timesOfDay, count, {}, NOW);

    // then
    expect(result).toEqual([]);
  });

  it('finds a dose far ahead for a long interval', () => {
    // given
    const timesOfDay = ['08:00'];

    // when
    const result = nextOccurrences(every(365), timesOfDay, 2, {}, NOW);

    // then
    expect(result).toEqual([
      new Date(2027, 0, 10, 8, 0),
      new Date(2028, 0, 10, 8, 0),
    ]);
  });
});

describe('previewOccurrences', () => {
  it('returns the next three doses from the current time', () => {
    // given
    const timesOfDay = ['08:00'];

    // when
    const result = previewOccurrences(every(1), timesOfDay, {}, NOW);

    // then
    expect(result).toEqual([at(1, 11, 8), at(1, 12, 8), at(1, 13, 8)]);
  });

  it('respects the period', () => {
    // given
    const timesOfDay = ['08:00'];
    const period = { startDate: at(1, 20, 0), endDate: at(1, 21, 0) };

    // when
    const result = previewOccurrences(every(1), timesOfDay, period, NOW);

    // then
    expect(result).toEqual([at(1, 20, 8), at(1, 21, 8)]);
  });
});

describe('weekday rhythms', () => {
  const weekdays = (days: number[]): Rhythm => ({
    intervalDays: 1,
    weekdays: days,
  });
  const SATURDAY = 6;
  const SUNDAY = 0;
  const MONDAY = 1;
  const WEDNESDAY = 3;
  const FRIDAY = 5;

  it('plans only the chosen days, in calendar order', () => {
    // given
    const rhythm = weekdays([SUNDAY, SATURDAY]);

    // when
    const result = occurrencesWithin(rhythm, ['09:00'], 14, {}, NOW);

    // then
    expect(result).toEqual([at(1, 11, 9), at(1, 17, 9), at(1, 18, 9)]);
  });

  it('skips a chosen day that already passed today', () => {
    // given
    const rhythm = weekdays([SATURDAY]);

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 8, {}, NOW);

    // then
    expect(result).toEqual([at(1, 17, 8)]);
  });

  it('plans a once-a-week schedule across a week boundary', () => {
    // given
    const rhythm = weekdays([MONDAY]);
    const now = at(1, 11, 12);

    // when
    const result = nextOccurrences(rhythm, ['08:00'], 3, {}, now);

    // then
    expect(result).toEqual([at(1, 12, 8), at(1, 19, 8), at(1, 26, 8)]);
  });

  it('keeps the days when the period starts in the middle of a week', () => {
    // given
    const rhythm = weekdays([MONDAY, WEDNESDAY, FRIDAY]);
    const period = { startDate: at(1, 14, 0) };

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 10, period, NOW);

    // then
    expect(result).toEqual([at(1, 14, 8), at(1, 16, 8), at(1, 19, 8)]);
  });

  it('stops at the end date', () => {
    // given
    const rhythm = weekdays([MONDAY, WEDNESDAY, FRIDAY]);
    const period = { endDate: at(1, 14, 0) };

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 14, period, NOW);

    // then
    expect(result).toEqual([at(1, 12, 8), at(1, 14, 8)]);
  });

  it('resumes on the next chosen day after a pause', () => {
    // given
    const rhythm = weekdays([MONDAY, FRIDAY]);
    const period = { pausedAt: at(1, 9, 0), resumeAt: at(1, 13, 0) };

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 10, period, NOW);

    // then
    expect(result).toEqual([at(1, 16, 8), at(1, 19, 8)]);
  });

  it('plans nothing while paused without a resume date', () => {
    // given
    const rhythm = weekdays([SATURDAY]);
    const period = { pausedAt: at(1, 9, 0), resumeAt: null };

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 14, period, NOW);

    // then
    expect(result).toEqual([]);
  });

  it('plans several times on each chosen day', () => {
    // given
    const rhythm = weekdays([SUNDAY]);

    // when
    const result = nextOccurrences(rhythm, ['20:00', '08:00'], 3, {}, NOW);

    // then
    expect(result).toEqual([at(1, 11, 8), at(1, 11, 20), at(1, 18, 8)]);
  });

  it('keeps the wall-clock time across the spring forward weekend', () => {
    // given
    const rhythm = weekdays([SATURDAY, SUNDAY]);
    const now = at(3, 27, 12);

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 3, {}, now);

    // then
    expect(result).toEqual([at(3, 28, 8), at(3, 29, 8)]);
  });

  it('keeps the wall-clock time across the fall back weekend', () => {
    // given
    const rhythm = weekdays([SATURDAY, SUNDAY]);
    const now = at(10, 23, 12);

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 3, {}, now);

    // then
    expect(result).toEqual([at(10, 24, 8), at(10, 25, 8)]);
  });

  it('plans every day when all seven days are chosen', () => {
    // given
    const rhythm = weekdays([0, 1, 2, 3, 4, 5, 6]);

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 4, {}, NOW);

    // then
    expect(result).toEqual([at(1, 11, 8), at(1, 12, 8), at(1, 13, 8)]);
  });

  it('plans nothing for an empty day list', () => {
    // given
    const rhythm = weekdays([]);

    // when
    const result = occurrencesWithin(rhythm, ['08:00'], 14, {}, NOW);

    // then
    expect(result).toEqual([]);
  });
});

describe('occurrencesWithin with a cycle', () => {
  const cycled = (overrides: Partial<Rhythm> = {}): Rhythm => ({
    intervalDays: 1,
    weekdays: null,
    cycle: { onDays: 3, offDays: 2, unit: 'days' },
    rhythmAnchor: new Date(2026, 0, 8),
    rhythmPausedDays: 0,
    ...overrides,
  });

  it('skips the off days of the cycle', () => {
    // given
    const rhythm = cycled();

    // when
    const result = occurrencesWithin(rhythm, ['18:00'], 10, {}, NOW);

    // then
    expect(result).toEqual([
      at(1, 10, 18),
      at(1, 13, 18),
      at(1, 14, 18),
      at(1, 15, 18),
      at(1, 18, 18),
      at(1, 19, 18),
    ]);
  });

  it('starts a cycle that begins in the future on its first day', () => {
    // given
    const rhythm = cycled({ rhythmAnchor: new Date(2026, 0, 15) });
    const period = { startDate: new Date(2026, 0, 15) };

    // when
    const result = occurrencesWithin(rhythm, ['18:00'], 12, period, NOW);

    // then
    expect(result).toEqual([
      at(1, 15, 18),
      at(1, 16, 18),
      at(1, 17, 18),
      at(1, 20, 18),
      at(1, 21, 18),
    ]);
  });

  it('freezes the cycle during a pause', () => {
    // given
    const period = { pausedAt: new Date(2026, 0, 9), resumeAt: at(1, 12, 0) };
    const rhythm = cycled(period);

    // when
    const result = occurrencesWithin(rhythm, ['18:00'], 6, period, NOW);

    // then
    expect(result).toEqual([
      at(1, 12, 18),
      at(1, 13, 18),
      at(1, 16, 18),
      at(1, 17, 18),
    ]);
  });

  it('combines the cycle with weekdays', () => {
    // given
    const rhythm = cycled({
      weekdays: [6, 0],
      cycle: { onDays: 7, offDays: 7, unit: 'days' },
      rhythmAnchor: new Date(2026, 0, 5),
    });

    // when
    const result = occurrencesWithin(rhythm, ['20:00'], 21, {}, NOW);

    // then
    expect(result).toEqual([
      at(1, 10, 20),
      at(1, 11, 20),
      at(1, 24, 20),
      at(1, 25, 20),
    ]);
  });
});

describe('occurrencesWithin with steps', () => {
  const prednisone: Rhythm = {
    intervalDays: 1,
    weekdays: null,
    steps: [
      { days: 3, quantity: 4 },
      { days: 3, quantity: 1 },
    ],
    rhythmAnchor: new Date(2026, 0, 9),
    rhythmPausedDays: 0,
  };

  it('generates the doses of the steps and then stops', () => {
    // when
    const result = occurrencesWithin(prednisone, ['18:00'], 20, {}, NOW);

    // then
    expect(result).toEqual([
      at(1, 10, 18),
      at(1, 11, 18),
      at(1, 12, 18),
      at(1, 13, 18),
      at(1, 14, 18),
    ]);
  });

  it('keeps generating after an open-ended last step', () => {
    // given
    const rampUp: Rhythm = {
      ...prednisone,
      steps: [
        { days: 1, quantity: 1 },
        { days: null, quantity: 2 },
      ],
    };

    // when
    const result = occurrencesWithin(rampUp, ['18:00'], 5, {}, NOW);

    // then
    expect(result).toHaveLength(5);
  });

  it('freezes the steps during a pause', () => {
    // given
    const period = { pausedAt: new Date(2026, 0, 9), resumeAt: at(1, 12, 0) };
    const rhythm: Rhythm = {
      ...prednisone,
      rhythmAnchor: new Date(2026, 0, 8),
      ...period,
    };

    // when
    const result = occurrencesWithin(rhythm, ['18:00'], 10, period, NOW);

    // then
    expect(result).toEqual([
      at(1, 12, 18),
      at(1, 13, 18),
      at(1, 14, 18),
      at(1, 15, 18),
      at(1, 16, 18),
    ]);
  });

  it('returns no previews once the taper is over', () => {
    // given
    const over: Rhythm = { ...prednisone, rhythmAnchor: new Date(2025, 11, 1) };

    // when
    const result = occurrencesWithin(over, ['18:00'], 20, {}, NOW);

    // then
    expect(result).toEqual([]);
  });
});
