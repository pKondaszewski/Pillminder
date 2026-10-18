import { courseEndDate, isPeriodInvalid } from '../schedule-period';

const NOW = new Date(2026, 9, 20, 12, 0);

describe('courseEndDate', () => {
  it('counts the start day as the first day of the course', () => {
    // given
    const startDate = new Date(2026, 9, 22);

    // when
    const result = courseEndDate(startDate, 7, NOW);

    // then
    expect(result).toEqual(new Date(2026, 9, 28));
  });

  it('starts from today without a start date', () => {
    // given
    const startDate = null;

    // when
    const result = courseEndDate(startDate, 5, NOW);

    // then
    expect(result).toEqual(new Date(2026, 9, 24));
  });
});

describe('isPeriodInvalid', () => {
  it('is true when the end is before the start', () => {
    // given
    const start = new Date(2026, 9, 22);
    const end = new Date(2026, 9, 21);

    // when
    const result = isPeriodInvalid(start, end);

    // then
    expect(result).toBe(true);
  });

  it('accepts the same day and open ends', () => {
    // given
    const day = new Date(2026, 9, 22);

    // when
    const results = [
      isPeriodInvalid(day, day),
      isPeriodInvalid(day, null),
      isPeriodInvalid(null, day),
    ];

    // then
    expect(results).toEqual([false, false, false]);
  });
});
