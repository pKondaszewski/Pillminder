import { isPaused } from '../schedule-pause';

const NOW = new Date(2026, 0, 10, 12, 0);

function at(month: number, day: number, hours: number, minutes = 0): Date {
  return new Date(2026, month - 1, day, hours, minutes);
}

describe('isPaused', () => {
  it('is false for a schedule that was never paused', () => {
    // given
    const schedule = { pausedAt: null, resumeAt: null };

    // when
    const result = isPaused(schedule, NOW);

    // then
    expect(result).toBe(false);
  });

  it('is true without a resume date', () => {
    // given
    const schedule = { pausedAt: at(1, 9, 8), resumeAt: null };

    // when
    const result = isPaused(schedule, NOW);

    // then
    expect(result).toBe(true);
  });

  it('is true on the day before the resume day', () => {
    // given
    const schedule = { pausedAt: at(1, 9, 8), resumeAt: at(1, 12, 0) };

    // when
    const result = isPaused(schedule, at(1, 11, 23, 59));

    // then
    expect(result).toBe(true);
  });

  it('is false on the resume day', () => {
    // given
    const schedule = { pausedAt: at(1, 9, 8), resumeAt: at(1, 12, 0) };

    // when
    const result = isPaused(schedule, at(1, 12, 0, 1));

    // then
    expect(result).toBe(false);
  });

  it('is false once the resume date is in the past', () => {
    // given
    const schedule = { pausedAt: at(1, 1, 8), resumeAt: at(1, 5, 0) };

    // when
    const result = isPaused(schedule, NOW);

    // then
    expect(result).toBe(false);
  });
});
