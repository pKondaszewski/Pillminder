import type { Rhythm } from '../dto/rhythm';
import type { ScheduleStep } from '../dto/schedule-step';
import { isRhythmDay } from '../rhythm-days';
import {
  hasFiniteTaper,
  isTaperOver,
  quantityOn,
  totalStepDays,
} from '../step-days';

const ANCHOR = new Date(2026, 0, 1);

const PREDNISONE: ScheduleStep[] = [
  { days: 3, quantity: 4 },
  { days: 3, quantity: 3 },
  { days: 3, quantity: 2 },
  { days: 3, quantity: 1 },
];

const RAMP_UP: ScheduleStep[] = [
  { days: 7, quantity: 1 },
  { days: null, quantity: 2 },
];

function tapered(
  steps: ScheduleStep[],
  overrides: Partial<Rhythm & { quantity: number }> = {},
): Rhythm & { quantity: number } {
  return {
    intervalDays: 1,
    weekdays: null,
    quantity: 9,
    steps,
    cycleAnchor: ANCHOR,
    cyclePausedDays: 0,
    ...overrides,
  };
}

function january(day: number): Date {
  return new Date(2026, 0, day);
}

describe('quantityOn', () => {
  it('returns the flat quantity without steps', () => {
    // given
    const schedule = tapered(RAMP_UP, { steps: null });

    // when
    const result = quantityOn(schedule, schedule.quantity, january(20));

    // then
    expect(result).toBe(9);
  });

  it('switches at the exact boundary between steps', () => {
    // given
    const schedule = tapered(PREDNISONE);

    // when
    const result = [1, 3, 4, 6, 7, 9, 10, 12].map((day) =>
      quantityOn(schedule, schedule.quantity, january(day)),
    );

    // then
    expect(result).toEqual([4, 4, 3, 3, 2, 2, 1, 1]);
  });

  it('returns nothing after the last finite step', () => {
    // given
    const schedule = tapered(PREDNISONE);

    // when
    const result = [12, 13, 14, 31].map((day) =>
      quantityOn(schedule, schedule.quantity, january(day)),
    );

    // then
    expect(result).toEqual([1, 0, 0, 0]);
  });

  it('stays at the last quantity when the last step is open-ended', () => {
    // given
    const schedule = tapered(RAMP_UP);

    // when
    const result = [1, 7, 8, 9, 365].map((day) =>
      quantityOn(schedule, schedule.quantity, new Date(2026, 0, day)),
    );

    // then
    expect(result).toEqual([1, 1, 2, 2, 2]);
  });

  it('uses the first step before a start date in the future', () => {
    // given
    const schedule = tapered(PREDNISONE, { cycleAnchor: january(20) });

    // when
    const result = quantityOn(schedule, schedule.quantity, january(10));

    // then
    expect(result).toBe(4);
  });

  it('freezes the taper while the schedule is paused', () => {
    // given
    const schedule = tapered(PREDNISONE, {
      pausedAt: january(2),
      resumeAt: january(6),
    });

    // when
    const result = [1, 2, 5, 6, 7, 8].map((day) =>
      quantityOn(schedule, schedule.quantity, january(day)),
    );

    // then
    expect(result).toEqual([4, 4, 4, 4, 4, 3]);
  });

  it('counts a paused period moved into the counter the same way', () => {
    // given
    const schedule = tapered(PREDNISONE, { cyclePausedDays: 4 });

    // when
    const result = [6, 7, 8].map((day) =>
      quantityOn(schedule, schedule.quantity, january(day)),
    );

    // then
    expect(result).toEqual([4, 4, 3]);
  });

  it('counts calendar days when the rhythm is on weekdays', () => {
    // given
    const schedule = tapered(RAMP_UP, {
      weekdays: [1, 3, 5],
      cycleAnchor: january(5),
    });

    // when
    const result = [5, 7, 9, 11, 12, 14].map((day) =>
      quantityOn(schedule, schedule.quantity, january(day)),
    );

    // then
    expect(result).toEqual([1, 1, 1, 1, 2, 2]);
  });

  it('counts calendar days through the off part of a cycle', () => {
    // given
    const schedule = tapered(RAMP_UP, {
      cycle: { onDays: 3, offDays: 7, unit: 'days' },
    });

    // when
    const result = [1, 7, 8, 11].map((day) =>
      quantityOn(schedule, schedule.quantity, january(day)),
    );

    // then
    expect(result).toEqual([1, 1, 2, 2]);
  });
});

describe('isTaperOver', () => {
  it('is over the day after the last finite step', () => {
    // given
    const rhythm = tapered(PREDNISONE);

    // when
    const result = [12, 13].map((day) => isTaperOver(rhythm, january(day)));

    // then
    expect(result).toEqual([false, true]);
  });

  it('never ends with an open-ended last step', () => {
    // given
    const rhythm = tapered(RAMP_UP);

    // when
    const result = isTaperOver(rhythm, new Date(2030, 0, 1));

    // then
    expect(result).toBe(false);
  });

  it('is not over without steps', () => {
    // given
    const rhythm = tapered(RAMP_UP, { steps: null });

    // when
    const result = isTaperOver(rhythm, new Date(2030, 0, 1));

    // then
    expect(result).toBe(false);
  });

  it('removes the days after the taper from the rhythm', () => {
    // given
    const rhythm = tapered(PREDNISONE);

    // when
    const result = [12, 13].map((day) =>
      isRhythmDay(rhythm, ANCHOR, january(day)),
    );

    // then
    expect(result).toEqual([true, false]);
  });
});

describe('hasFiniteTaper', () => {
  it('tells a stopping taper from an open-ended one', () => {
    // when
    const result = [PREDNISONE, RAMP_UP].map((steps) =>
      hasFiniteTaper(tapered(steps)),
    );

    // then
    expect(result).toEqual([true, false]);
  });
});

describe('totalStepDays', () => {
  it('adds up the finite steps', () => {
    // when
    const result = [PREDNISONE, RAMP_UP].map(totalStepDays);

    // then
    expect(result).toEqual([12, 7]);
  });
});
