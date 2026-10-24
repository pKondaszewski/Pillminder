import type { Schedule } from '@/schedules/schedule-service';

import {
  consumptionBetween,
  productReorderStatus,
  reorderStatus,
} from '../reorder';

const NOW = new Date(2026, 0, 10, 12, 0);
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function rhythm(overrides: Partial<Schedule>): Schedule {
  return {
    id: 'schedule-1',
    productId: 'product-1',
    intervalDays: 1,
    weekdays: null,
    cycle: null,
    cycleAnchor: null,
    cyclePausedDays: 0,
    timesOfDay: ['08:00'],
    quantity: 1,
    startDate: null,
    endDate: null,
    pausedAt: null,
    resumeAt: null,
    ...overrides,
  };
}

function daysFromNow(days: number): Date {
  return new Date(NOW.getTime() + days * MS_PER_DAY);
}

describe('reorderStatus', () => {
  it('returns no estimate when stock is null', () => {
    // given
    const stock = null;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status).toEqual({
      dailyConsumption: 1,
      daysLeft: null,
      runOutAt: null,
      reorderAt: null,
      isLow: false,
    });
  });

  it('returns no estimate when stock is undefined', () => {
    // given
    const stock = undefined;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.daysLeft).toBeNull();
    expect(status.isLow).toBe(false);
  });

  it('returns no estimate when there are no schedules', () => {
    // given
    const stock = 10;
    const schedules: Schedule[] = [];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status).toEqual({
      dailyConsumption: 0,
      daysLeft: null,
      runOutAt: null,
      reorderAt: null,
      isLow: false,
    });
  });

  it('computes days left for a single daily schedule without a period', () => {
    // given
    const stock = 20;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.dailyConsumption).toBe(1);
    expect(status.daysLeft).toBe(20);
    expect(status.runOutAt).toEqual(daysFromNow(20));
    expect(status.reorderAt).toEqual(daysFromNow(13));
    expect(status.isLow).toBe(false);
  });

  it('counts every time of day as a separate intake', () => {
    // given
    const stock = 20;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00', '20:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.dailyConsumption).toBe(2);
    expect(status.daysLeft).toBe(10);
  });

  it('multiplies consumption by quantity per intake', () => {
    // given
    const stock = 20;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00'], quantity: 2 }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.dailyConsumption).toBe(2);
    expect(status.daysLeft).toBe(10);
  });

  it('spreads consumption over an interval longer than one day', () => {
    // given
    const stock = 10;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 2, timesOfDay: ['08:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.dailyConsumption).toBe(0.5);
    expect(status.daysLeft).toBe(20);
  });

  it('sums consumption of several schedules without a period', () => {
    // given
    const stock = 20;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00'] }),
      rhythm({ intervalDays: 2, timesOfDay: ['20:00'], quantity: 2 }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.dailyConsumption).toBe(2);
    expect(status.daysLeft).toBe(10);
  });

  it('counts a schedule that has not started yet only from its start date', () => {
    // given
    const stock = 10;
    const schedules: Schedule[] = [
      rhythm({
        intervalDays: 1,
        timesOfDay: ['08:00'],
        startDate: new Date(2026, 0, 15),
      }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.dailyConsumption).toBe(0);
    expect(status.daysLeft).toBe(5 + 10);
  });

  it('returns no estimate when the only schedule ends before the stock runs out', () => {
    // given
    const stock = 100;
    const schedules: Schedule[] = [
      rhythm({
        intervalDays: 1,
        timesOfDay: ['08:00'],
        endDate: new Date(2026, 0, 14),
      }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.daysLeft).toBeNull();
    expect(status.runOutAt).toBeNull();
    expect(status.reorderAt).toBeNull();
    expect(status.isLow).toBe(false);
  });

  it('runs out when a schedule with a period covers the whole stock', () => {
    // given
    const stock = 5;
    const schedules: Schedule[] = [
      rhythm({
        intervalDays: 1,
        timesOfDay: ['08:00'],
        endDate: new Date(2026, 0, 30),
      }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.daysLeft).toBe(5);
  });

  it('switches consumption when one of two schedules ends', () => {
    // given
    const stock = 7;
    const schedules: Schedule[] = [
      rhythm({
        intervalDays: 1,
        timesOfDay: ['08:00'],
        endDate: new Date(2026, 0, 12),
      }),
      rhythm({ intervalDays: 1, timesOfDay: ['20:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    // days 0-2 consume 2/day (6 units), then 1 unit left at 1/day
    expect(status.daysLeft).toBe(4);
  });

  it('marks stock as low when days left is below the threshold', () => {
    // given
    const stock = 6;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.isLow).toBe(true);
  });

  it('does not mark stock as low when days left equals the threshold', () => {
    // given
    const stock = 7;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.isLow).toBe(false);
    expect(status.reorderAt).toEqual(NOW);
  });

  it('reports zero days left and low stock for an empty stock', () => {
    // given
    const stock = 0;
    const schedules: Schedule[] = [
      rhythm({ intervalDays: 1, timesOfDay: ['08:00'] }),
    ];

    // when
    const status = reorderStatus(stock, schedules, NOW);

    // then
    expect(status.daysLeft).toBe(0);
    expect(status.isLow).toBe(true);
  });
});

describe('reorderStatus with a paused schedule', () => {
  it('gives no estimate while paused without a resume date', () => {
    // given
    const schedules: Schedule[] = [
      rhythm({
        intervalDays: 1,
        timesOfDay: ['08:00'],
        pausedAt: daysFromNow(-1),
      }),
    ];

    // when
    const status = reorderStatus(5, schedules, NOW);

    // then
    expect(status).toMatchObject({
      dailyConsumption: 0,
      daysLeft: null,
      isLow: false,
    });
  });

  it('counts consumption only from the resume day', () => {
    // given
    const schedules: Schedule[] = [
      rhythm({
        intervalDays: 1,
        timesOfDay: ['08:00'],
        pausedAt: daysFromNow(-1),
        resumeAt: daysFromNow(10),
      }),
    ];

    // when
    const status = reorderStatus(5, schedules, NOW);

    // then
    expect(status.daysLeft).toBe(15);
    expect(status.isLow).toBe(false);
  });

  it('treats a pause whose resume date has passed as not paused', () => {
    // given
    const schedules: Schedule[] = [
      rhythm({
        intervalDays: 1,
        timesOfDay: ['08:00'],
        pausedAt: daysFromNow(-10),
        resumeAt: daysFromNow(-2),
      }),
    ];

    // when
    const status = reorderStatus(5, schedules, NOW);

    // then
    expect(status.daysLeft).toBe(5);
    expect(status.isLow).toBe(true);
  });
});

describe('productReorderStatus', () => {
  const noRhythm: Schedule[] = [];

  it('is low at the threshold for a product without a schedule', () => {
    // given
    const product = { stock: 3, reorderThreshold: 3 };

    // when
    const status = productReorderStatus(product, noRhythm, NOW);

    // then
    expect(status.isLow).toBe(true);
    expect(status.reorderAt).toEqual(NOW);
    expect(status.daysLeft).toBeNull();
  });

  it('is not low while the stock is above the threshold', () => {
    // given
    const product = { stock: 4, reorderThreshold: 3 };

    // when
    const status = productReorderStatus(product, noRhythm, NOW);

    // then
    expect(status.isLow).toBe(false);
    expect(status.reorderAt).toBeNull();
  });

  it('is low at zero stock with a zero threshold', () => {
    // given
    const product = { stock: 0, reorderThreshold: 0 };

    // when
    const status = productReorderStatus(product, noRhythm, NOW);

    // then
    expect(status.isLow).toBe(true);
  });

  it.each([
    ['an empty threshold', { stock: 1, reorderThreshold: null }],
    ['an untracked stock', { stock: null, reorderThreshold: 5 }],
  ])('has no alert with %s', (_name, product) => {
    // when
    const status = productReorderStatus(product, noRhythm, NOW);

    // then
    expect(status.isLow).toBe(false);
    expect(status.reorderAt).toBeNull();
  });

  it('ignores the threshold while a schedule is active', () => {
    // given
    const product = { stock: 100, reorderThreshold: 100 };

    // when
    const status = productReorderStatus(product, [rhythm({})], NOW);

    // then
    expect(status).toEqual(reorderStatus(100, [rhythm({})], NOW));
    expect(status.isLow).toBe(false);
  });

  it('uses the threshold when the only schedule has ended', () => {
    // given
    const product = { stock: 2, reorderThreshold: 5 };
    const ended = rhythm({ endDate: daysFromNow(-3) });

    // when
    const status = productReorderStatus(product, [ended], NOW);

    // then
    expect(status.isLow).toBe(true);
  });

  it('uses the threshold when the only schedule is paused', () => {
    // given
    const product = { stock: 2, reorderThreshold: 5 };
    const paused = rhythm({ pausedAt: daysFromNow(-1), resumeAt: null });

    // when
    const status = productReorderStatus(product, [paused], NOW);

    // then
    expect(status.isLow).toBe(true);
  });
});

describe('reorderStatus on weekdays', () => {
  const weekendly = rhythm({ weekdays: [0, 6], timesOfDay: ['08:00'] });

  it('averages the consumption over the week', () => {
    // given
    const schedules = [weekendly];

    // when
    const status = reorderStatus(null, schedules, NOW);

    // then
    expect(status.dailyConsumption).toBeCloseTo(2 / 7);
  });

  it('runs out at the end of the last chosen day the stock covers', () => {
    // given
    const stock = 4;

    // when
    const status = reorderStatus(stock, [weekendly], NOW);

    // then
    expect(status.daysLeft).toBeCloseTo(9);
  });

  it('spends one unit a week on a once-a-week schedule', () => {
    // given
    const weekly = rhythm({ weekdays: [1] });

    // when
    const status = reorderStatus(3, [weekly], NOW);

    // then
    expect(status.daysLeft).toBeCloseTo(17);
  });
});

describe('consumptionBetween on weekdays', () => {
  it('counts the chosen days inside a trip', () => {
    // given
    const schedules = [rhythm({ weekdays: [0, 6], quantity: 2 })];

    // when
    const units = consumptionBetween(
      schedules,
      new Date(2026, 0, 12),
      new Date(2026, 0, 18),
    );

    // then
    expect(units).toBe(4);
  });

  it('is zero for a trip that misses the chosen days', () => {
    // given
    const schedules = [rhythm({ weekdays: [0, 6] })];

    // when
    const units = consumptionBetween(
      schedules,
      new Date(2026, 0, 12),
      new Date(2026, 0, 16),
    );

    // then
    expect(units).toBe(0);
  });
});

describe('reorderStatus with a cycle', () => {
  const cycled = (overrides: Partial<Schedule> = {}) =>
    rhythm({
      cycle: { onDays: 3, offDays: 2, unit: 'days' },
      cycleAnchor: new Date(2026, 0, 10),
      ...overrides,
    });

  it('averages the consumption over the on and off days', () => {
    // given
    const schedules = [cycled()];

    // when
    const status = reorderStatus(null, schedules, NOW);

    // then
    expect(status.dailyConsumption).toBeCloseTo(3 / 5);
  });

  it('spends nothing on the off days', () => {
    // given
    const stock = 4;

    // when
    const status = reorderStatus(stock, [cycled()], NOW);

    // then
    expect(status.daysLeft).toBeCloseTo(6);
  });

  it('counts only the on days inside a trip', () => {
    // given
    const schedules = [cycled({ quantity: 2 })];

    // when
    const units = consumptionBetween(
      schedules,
      new Date(2026, 0, 10),
      new Date(2026, 0, 16),
    );

    // then
    expect(units).toBe(10);
  });

  it('is zero for a trip that falls in the off days', () => {
    // given
    const schedules = [cycled()];

    // when
    const units = consumptionBetween(
      schedules,
      new Date(2026, 0, 13),
      new Date(2026, 0, 14),
    );

    // then
    expect(units).toBe(0);
  });
});
