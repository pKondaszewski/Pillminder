import {
  ARC_HORIZON_Y,
  ARC_RADIUS,
  arcPath,
  arcPoint,
  axisTicks,
  daySymbol,
  pieSlicePath,
  skyPath,
  skyTone,
} from '../day-arc';
import { dayPhases } from '../day-phases';
import type { DayCounts, TodayCardState } from '../dose-today-card';
import type { TodayDose } from '../dto/today-dose-output';

const PHASES = dayPhases(new Date(2026, 9, 10), null);
const COUNTS: DayCounts = {
  total: 1,
  taken: 0,
  skipped: 0,
  overdue: 0,
  planned: 1,
};

function at(hours: number, minutes = 0): Date {
  return new Date(2026, 9, 10, hours, minutes);
}

function cardState(kind: TodayCardState['kind']): TodayCardState {
  switch (kind) {
    case 'calm':
      return {
        kind,
        counts: COUNTS,
        next: {} as TodayDose,
        untilNextMs: 0,
      };
    case 'overdue':
      return {
        kind,
        counts: COUNTS,
        overdue: [],
        names: [],
        otherCount: 0,
        oldestLateMs: 0,
      };
    default:
      return { kind, counts: COUNTS };
  }
}

describe('arcPoint', () => {
  it('puts the axis start and end on the horizon and the middle at the top', () => {
    // when
    const start = arcPoint(0);
    const middle = arcPoint(0.5);
    const end = arcPoint(1);

    // then
    expect(start.y).toBeCloseTo(ARC_HORIZON_Y);
    expect(end.y).toBeCloseTo(ARC_HORIZON_Y);
    expect(end.x - start.x).toBeCloseTo(2 * ARC_RADIUS);
    expect(middle.x).toBeCloseTo((start.x + end.x) / 2);
    expect(middle.y).toBeCloseTo(ARC_HORIZON_Y - ARC_RADIUS);
  });
});

describe('arcPath', () => {
  it('draws a clockwise arc between two positions', () => {
    // when
    const path = arcPath(0, 1);

    // then
    expect(path).toBe('M19.0 158.0A140 140 0 0 1 299.0 158.0');
  });
});

describe('skyPath', () => {
  it('fills from the arc start to now and closes down to the horizon', () => {
    // when
    const path = skyPath(0.5);

    // then
    expect(path).toBe('M19.0 158A140 140 0 0 1 159.0 18.0L159.0 158Z');
  });
});

describe('pieSlicePath', () => {
  it('draws a full circle for a single slice', () => {
    // when
    const path = pieSlicePath({ x: 10, y: 20 }, 5, 0, 1);

    // then
    expect(path).toBe('M5.0 20.0a5.0 5.0 0 1 0 10.0 0a5.0 5.0 0 1 0 -10.0 0');
  });

  it('draws the second of two slices as the right-hand to left-hand half', () => {
    // when
    const path = pieSlicePath({ x: 10, y: 20 }, 5, 1, 2);

    // then
    expect(path).toBe('M10.0 20.0L10.0 25.0A5.0 5.0 0 0 1 10.0 15.0Z');
  });
});

describe('axisTicks', () => {
  it('labels 06 and 24 under the horizon ends and 12 and 18 outside the arc', () => {
    // when
    const ticks = axisTicks();

    // then
    expect(ticks.map((tick) => tick.label)).toEqual(['06', '12', '18', '24']);
    expect(ticks[0]).toMatchObject({ x: 0, y: 173, anchor: 'start' });
    expect(ticks[3]).toMatchObject({ x: 318, y: 173, anchor: 'end' });
    expect(ticks[1].anchor).toBe('middle');
    expect(ticks[1].y).toBeLessThan(ARC_HORIZON_Y);
  });
});

describe('daySymbol', () => {
  it.each([
    [at(5, 59), 'moon'],
    [at(6), 'risingSun'],
    [at(11, 59), 'risingSun'],
    [at(12), 'sun'],
    [at(17, 59), 'sun'],
    [at(18), 'moon'],
    [at(23, 30), 'moon'],
  ])('picks the symbol for %s', (now, expected) => {
    // when
    const symbol = daySymbol(now, PHASES);

    // then
    expect(symbol).toBe(expected);
  });
});

describe('skyTone', () => {
  it.each([
    ['calm', 'sun', 'day'],
    ['calm', 'risingSun', 'day'],
    ['calm', 'moon', 'night'],
    ['overdue', 'moon', 'overdue'],
    ['overdue', 'sun', 'overdue'],
    ['done', 'moon', 'done'],
    ['done', 'sun', 'done'],
  ] as const)('maps %s card at %s to %s sky', (kind, symbol, expected) => {
    // when
    const tone = skyTone(cardState(kind), symbol);

    // then
    expect(tone).toBe(expected);
  });

  it('has no sky without a now symbol', () => {
    // when
    const tone = skyTone(cardState('calm'), null);

    // then
    expect(tone).toBeNull();
  });
});
