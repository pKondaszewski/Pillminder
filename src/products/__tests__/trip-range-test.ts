import { isoDay } from '@/config/date-utils';

import {
  isEdgeOfRange,
  isInsideRange,
  tapDay,
  type TripRange,
} from '../trip-range';

const OCT_24 = new Date(2026, 9, 24);
const OCT_27 = new Date(2026, 9, 27);
const OCT_30 = new Date(2026, 9, 30);
const OCT_20 = new Date(2026, 9, 20);

const complete: TripRange = { from: OCT_24, to: OCT_30 };
const open: TripRange = { from: OCT_24, to: null };

describe('tapDay', () => {
  it('sets the end on the second tap after the start', () => {
    // when
    const next = tapDay(open, OCT_30);

    // then
    expect(isoDay(next.from)).toBe('2026-10-24');
    expect(next.to && isoDay(next.to)).toBe('2026-10-30');
  });

  it('allows a one-day range', () => {
    // when
    const next = tapDay(open, new Date(2026, 9, 24, 15));

    // then
    expect(next.to && isoDay(next.to)).toBe('2026-10-24');
  });

  it('starts over when the tapped day is before the start', () => {
    // when
    const next = tapDay(open, OCT_20);

    // then
    expect(isoDay(next.from)).toBe('2026-10-20');
    expect(next.to).toBeNull();
  });

  it('starts over when the range is already complete', () => {
    // when
    const next = tapDay(complete, OCT_27);

    // then
    expect(isoDay(next.from)).toBe('2026-10-27');
    expect(next.to).toBeNull();
  });
});

describe('isInsideRange', () => {
  it.each([
    [OCT_27, true],
    [OCT_24, false],
    [OCT_30, false],
    [OCT_20, false],
  ])('checks %s against a complete range', (day, expected) => {
    // when
    const inside = isInsideRange(complete, day);

    // then
    expect(inside).toBe(expected);
  });

  it('is false for an open range', () => {
    // when
    const inside = isInsideRange(open, OCT_27);

    // then
    expect(inside).toBe(false);
  });
});

describe('isEdgeOfRange', () => {
  it('matches both ends regardless of the time of day', () => {
    // when
    const edges = [OCT_24, new Date(2026, 9, 30, 18), OCT_27].map((day) =>
      isEdgeOfRange(complete, day),
    );

    // then
    expect(edges).toEqual([true, true, false]);
  });

  it('matches only the start of an open range', () => {
    // when
    const edges = [OCT_24, OCT_30].map((day) => isEdgeOfRange(open, day));

    // then
    expect(edges).toEqual([true, false]);
  });
});
