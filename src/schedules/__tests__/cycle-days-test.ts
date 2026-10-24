import { isCycleOnDay, pausedDaysBefore } from '../cycle-days';
import type { Rhythm } from '../dto/rhythm';
import { isRhythmDay } from '../rhythm-days';

const ANCHOR = new Date(2026, 0, 1);

function cycled(
  onDays: number,
  offDays: number,
  overrides: Partial<Rhythm> = {},
): Rhythm {
  return {
    intervalDays: 1,
    weekdays: null,
    cycle: { onDays, offDays, unit: 'days' },
    rhythmAnchor: ANCHOR,
    rhythmPausedDays: 0,
    ...overrides,
  };
}

function january(day: number): Date {
  return new Date(2026, 0, day);
}

function onDaysOf(rhythm: Rhythm, days: number[]): number[] {
  return days.filter((day) => isCycleOnDay(rhythm, january(day)));
}

describe('isCycleOnDay', () => {
  it('is on for every day without a cycle', () => {
    // given
    const rhythm: Rhythm = { intervalDays: 1, weekdays: null };

    // when
    const result = isCycleOnDay(rhythm, january(20));

    // then
    expect(result).toBe(true);
  });

  it('switches at the exact boundary of the on and off part', () => {
    // given
    const rhythm = cycled(21, 7);

    // when
    const result = [1, 21, 22, 28, 29, 30].map((day) =>
      isCycleOnDay(rhythm, january(day)),
    );

    // then
    expect(result).toEqual([true, true, false, false, true, true]);
  });

  it('is off before the anchor', () => {
    // given
    const rhythm = cycled(3, 2, { rhythmAnchor: january(10) });

    // when
    const result = onDaysOf(rhythm, [7, 8, 9, 10]);

    // then
    expect(result).toEqual([10]);
  });

  it('repeats the cycle over a long range', () => {
    // given
    const rhythm = cycled(56, 28);
    const days = Array.from({ length: 365 }, (_, index) => index);

    // when
    const onDays = days.filter((offset) =>
      isCycleOnDay(rhythm, new Date(2026, 0, 1 + offset)),
    );

    // then
    expect(onDays).toHaveLength(4 * 56 + 29);
    expect(onDays.slice(55, 58)).toEqual([55, 84, 85]);
    expect(onDays[onDays.length - 1]).toBe(364);
  });

  it('keeps counting across a daylight saving change', () => {
    // given
    const rhythm = cycled(2, 2, { rhythmAnchor: new Date(2026, 2, 27) });

    // when
    const result = [27, 28, 29, 30, 31].map((day) =>
      isCycleOnDay(rhythm, new Date(2026, 2, day)),
    );

    // then
    expect(result).toEqual([true, true, false, false, true]);
  });

  it('is off for the whole cycle when it starts in the future', () => {
    // given
    const rhythm = cycled(3, 2, { rhythmAnchor: january(20) });

    // when
    const result = onDaysOf(rhythm, [18, 19, 20, 21, 22, 23, 24, 25]);

    // then
    expect(result).toEqual([20, 21, 22, 25]);
  });

  it('does not count the days of a pause in the on part', () => {
    // given
    const rhythm = cycled(3, 2, {
      pausedAt: january(2),
      resumeAt: january(4),
    });

    // when
    const result = onDaysOf(rhythm, [1, 4, 5, 6, 7, 8, 9]);

    // then
    expect(result).toEqual([1, 4, 5, 8, 9]);
  });

  it('does not count the days of a pause in the off part', () => {
    // given
    const rhythm = cycled(3, 2, {
      pausedAt: january(4),
      resumeAt: january(6),
    });

    // when
    const result = onDaysOf(rhythm, [3, 6, 7, 8, 9, 10]);

    // then
    expect(result).toEqual([3, 8, 9, 10]);
  });

  it('uses the counter of closed pauses', () => {
    // given
    const rhythm = cycled(3, 2, { rhythmPausedDays: 2 });

    // when
    const result = onDaysOf(rhythm, [4, 5, 6, 7, 8, 9]);

    // then
    expect(result).toEqual([4, 5, 8, 9]);
  });
});

describe('isRhythmDay with a cycle', () => {
  it('applies the weekdays inside the on part only', () => {
    // given
    const saturdayAndSunday = [6, 0];
    const rhythm = cycled(7, 7, {
      weekdays: saturdayAndSunday,
      rhythmAnchor: january(5),
    });

    // when
    const result = [10, 11, 12, 17, 18, 24, 25].map((day) =>
      isRhythmDay(rhythm, january(5), january(day)),
    );

    // then
    expect(result).toEqual([true, true, false, false, false, true, true]);
  });
});

describe('pausedDaysBefore', () => {
  it('counts only the part of a pause before the given day', () => {
    // given
    const rhythm = cycled(3, 2, { pausedAt: january(2), resumeAt: january(8) });

    // when
    const result = [1, 2, 4, 8, 12].map((day) =>
      pausedDaysBefore(rhythm, january(day)),
    );

    // then
    expect(result).toEqual([0, 0, 2, 6, 6]);
  });

  it('counts a pause without a resume date up to the given day', () => {
    // given
    const rhythm = cycled(3, 2, { pausedAt: january(2), rhythmPausedDays: 1 });

    // when
    const result = pausedDaysBefore(rhythm, january(5));

    // then
    expect(result).toBe(4);
  });

  it('ignores the days of a pause before the cycle started', () => {
    // given
    const rhythm = cycled(3, 2, {
      rhythmAnchor: january(10),
      pausedAt: january(5),
      resumeAt: january(12),
    });

    // when
    const result = pausedDaysBefore(rhythm, january(15));

    // then
    expect(result).toBe(2);
  });

  it('gives the same cycle after the pause is moved into the counter', () => {
    // given
    const withPause = cycled(3, 2, {
      pausedAt: january(2),
      resumeAt: january(4),
    });
    const settled = cycled(3, 2, {
      rhythmPausedDays: pausedDaysBefore(withPause, january(4)),
    });
    const days = Array.from({ length: 20 }, (_, index) => index + 4);

    // when
    const result = onDaysOf(settled, days);

    // then
    expect(result).toEqual(onDaysOf(withPause, days));
  });

  it('is zero without a cycle', () => {
    // given
    const rhythm: Rhythm = {
      intervalDays: 1,
      weekdays: null,
      pausedAt: january(2),
    };

    // when
    const result = pausedDaysBefore(rhythm, january(9));

    // then
    expect(result).toBe(0);
  });
});

describe('pausedDaysBefore without a cycle', () => {
  it('counts the pause for a rhythm that only has an anchor', () => {
    // given
    const rhythm: Rhythm = {
      intervalDays: 1,
      weekdays: null,
      rhythmAnchor: ANCHOR,
      rhythmPausedDays: 2,
      pausedAt: january(10),
      resumeAt: january(14),
    };

    // when
    const result = [9, 12, 20].map((day) =>
      pausedDaysBefore(rhythm, january(day)),
    );

    // then
    expect(result).toEqual([2, 4, 6]);
  });

  it('is zero without an anchor', () => {
    // given
    const rhythm: Rhythm = {
      intervalDays: 1,
      weekdays: null,
      pausedAt: january(10),
    };

    // when
    const result = pausedDaysBefore(rhythm, january(20));

    // then
    expect(result).toBe(0);
  });
});
