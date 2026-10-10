import type { RhythmInput } from '../dto/rhythm-input';
import { reorderStatus } from '../reorder';

const NOW = new Date(2026, 0, 10, 12, 0);
const THRESHOLD_DAYS = 7;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  return new Date(NOW.getTime() + days * MS_PER_DAY);
}

describe('reorderStatus', () => {
  it('returns no estimate when stock is null', () => {
    // given
    const stock = null;
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

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
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.daysLeft).toBeNull();
    expect(status.isLow).toBe(false);
  });

  it('returns no estimate when there are no schedules', () => {
    // given
    const stock = 10;
    const schedules: RhythmInput[] = [];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

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
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

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
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00', '20:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.dailyConsumption).toBe(2);
    expect(status.daysLeft).toBe(10);
  });

  it('multiplies consumption by quantity per intake', () => {
    // given
    const stock = 20;
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'], quantity: 2 },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.dailyConsumption).toBe(2);
    expect(status.daysLeft).toBe(10);
  });

  it('spreads consumption over an interval longer than one day', () => {
    // given
    const stock = 10;
    const schedules: RhythmInput[] = [
      { intervalDays: 2, timesOfDay: ['08:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.dailyConsumption).toBe(0.5);
    expect(status.daysLeft).toBe(20);
  });

  it('sums consumption of several schedules without a period', () => {
    // given
    const stock = 20;
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'] },
      { intervalDays: 2, timesOfDay: ['20:00'], quantity: 2 },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.dailyConsumption).toBe(2);
    expect(status.daysLeft).toBe(10);
  });

  it('counts a schedule that has not started yet only from its start date', () => {
    // given
    const stock = 10;
    const schedules: RhythmInput[] = [
      {
        intervalDays: 1,
        timesOfDay: ['08:00'],
        startDate: new Date(2026, 0, 15),
      },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.dailyConsumption).toBe(0);
    expect(status.daysLeft).toBe(5 + 10);
  });

  it('returns no estimate when the only schedule ends before the stock runs out', () => {
    // given
    const stock = 100;
    const schedules: RhythmInput[] = [
      {
        intervalDays: 1,
        timesOfDay: ['08:00'],
        endDate: new Date(2026, 0, 14),
      },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.daysLeft).toBeNull();
    expect(status.runOutAt).toBeNull();
    expect(status.reorderAt).toBeNull();
    expect(status.isLow).toBe(false);
  });

  it('runs out when a schedule with a period covers the whole stock', () => {
    // given
    const stock = 5;
    const schedules: RhythmInput[] = [
      {
        intervalDays: 1,
        timesOfDay: ['08:00'],
        endDate: new Date(2026, 0, 30),
      },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.daysLeft).toBe(5);
  });

  it('switches consumption when one of two schedules ends', () => {
    // given
    const stock = 7;
    const schedules: RhythmInput[] = [
      {
        intervalDays: 1,
        timesOfDay: ['08:00'],
        endDate: new Date(2026, 0, 12),
      },
      { intervalDays: 1, timesOfDay: ['20:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    // days 0-2 consume 2/day (6 units), then 1 unit left at 1/day
    expect(status.daysLeft).toBe(4);
  });

  it('marks stock as low when days left is below the threshold', () => {
    // given
    const stock = 6;
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.isLow).toBe(true);
  });

  it('does not mark stock as low when days left equals the threshold', () => {
    // given
    const stock = 7;
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.isLow).toBe(false);
    expect(status.reorderAt).toEqual(NOW);
  });

  it('uses the given threshold instead of the default', () => {
    // given
    const stock = 10;
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'] },
    ];
    const thresholdDays = 14;

    // when
    const status = reorderStatus(stock, schedules, thresholdDays, NOW);

    // then
    expect(status.isLow).toBe(true);
    expect(status.reorderAt).toEqual(daysFromNow(-4));
  });

  it('reports zero days left and low stock for an empty stock', () => {
    // given
    const stock = 0;
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'] },
    ];

    // when
    const status = reorderStatus(stock, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.daysLeft).toBe(0);
    expect(status.isLow).toBe(true);
  });
});

describe('reorderStatus with a paused schedule', () => {
  it('gives no estimate while paused without a resume date', () => {
    // given
    const schedules: RhythmInput[] = [
      { intervalDays: 1, timesOfDay: ['08:00'], pausedAt: daysFromNow(-1) },
    ];

    // when
    const status = reorderStatus(5, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status).toMatchObject({
      dailyConsumption: 0,
      daysLeft: null,
      isLow: false,
    });
  });

  it('counts consumption only from the resume day', () => {
    // given
    const schedules: RhythmInput[] = [
      {
        intervalDays: 1,
        timesOfDay: ['08:00'],
        pausedAt: daysFromNow(-1),
        resumeAt: daysFromNow(10),
      },
    ];

    // when
    const status = reorderStatus(5, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.daysLeft).toBe(15);
    expect(status.isLow).toBe(false);
  });

  it('treats a pause whose resume date has passed as not paused', () => {
    // given
    const schedules: RhythmInput[] = [
      {
        intervalDays: 1,
        timesOfDay: ['08:00'],
        pausedAt: daysFromNow(-10),
        resumeAt: daysFromNow(-2),
      },
    ];

    // when
    const status = reorderStatus(5, schedules, THRESHOLD_DAYS, NOW);

    // then
    expect(status.daysLeft).toBe(5);
    expect(status.isLow).toBe(true);
  });
});
