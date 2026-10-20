import {
  dayStoneDays,
  ROAD_PANEL_MARGIN,
  ROAD_PANEL_PADDING,
  roadAxis,
  roadPath,
  roadX,
  roadY,
} from '../road';

describe('roadAxis', () => {
  it('starts the first day at the inner edge of the glass panel', () => {
    // given
    const width = 360;

    // when
    const axis = roadAxis(width, 8);

    // then
    expect(axis.start).toBe(ROAD_PANEL_MARGIN + ROAD_PANEL_PADDING);
    expect(roadX(axis, 0)).toBe(axis.start);
    expect(axis.limit).toBe(width - axis.start);
  });

  it('puts the end of the trip at the destination and spreads days evenly', () => {
    // given
    const axis = roadAxis(360, 8);

    // when
    const tripEnd = roadX(axis, 8);
    const halfway = roadX(axis, 4);

    // then
    expect(tripEnd).toBe(axis.end);
    expect(halfway).toBeCloseTo((axis.start + axis.end) / 2);
  });
});

describe('roadY', () => {
  it('stays within a few pixels of the road line', () => {
    // given
    const xs = [0, 90, 180, 270, 360];

    // when
    const ys = xs.map((x) => roadY(360, x));

    // then
    const spread = Math.max(...ys) - Math.min(...ys);
    expect(spread).toBeLessThanOrEqual(10);
  });
});

describe('roadPath', () => {
  it('starts and ends exactly at the requested x', () => {
    // when
    const path = roadPath(360, 28, 290);

    // then
    expect(path.startsWith('M28.0 ')).toBe(true);
    expect(path).toMatch(/L290\.0 [\d.]+$/);
  });
});

describe('dayStoneDays', () => {
  it('puts a stone on every day between departure and return', () => {
    // when
    const days = dayStoneDays(5);

    // then
    expect(days).toEqual([1, 2, 3, 4]);
  });

  it('has no stones for a one-day trip', () => {
    // when
    const days = dayStoneDays(1);

    // then
    expect(days).toEqual([]);
  });

  it('thins the stones out on a long trip', () => {
    // when
    const days = dayStoneDays(60);

    // then
    expect(days.length).toBeLessThanOrEqual(14);
    expect(days[0]).toBeGreaterThan(1);
  });
});
