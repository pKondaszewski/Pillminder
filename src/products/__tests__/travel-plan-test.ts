import type { Product } from '@/products/product-service';
import type { Schedule } from '@/schedules/schedule-service';

import { buildTravelPlan, type TravelPlanContext } from '../travel-plan';

const NOW = new Date(2026, 0, 10, 12, 0);
const DEPARTURE = new Date(2026, 0, 11);
const RETURN_DAY = new Date(2026, 0, 17);

const MESSAGES: Record<string, string> = {
  'travel.pieces': '{{count}} szt.',
  'unit.tablet': '{{count}} tabl.',
};

const context: TravelPlanContext = {
  t: (key, options = {}) =>
    Object.entries(options).reduce(
      (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
      MESSAGES[key] ?? key,
    ),
  locale: 'pl',
  now: NOW,
};

function product(overrides: Partial<Product> & { id: string }): Product {
  return {
    name: 'Product',
    category: 'medication',
    strength: null,
    unit: null,
    status: 'active',
    stock: null,
    ...overrides,
  } as Product;
}

function schedule(overrides: Partial<Schedule> = {}): Schedule {
  return {
    id: 'schedule-1',
    productId: 'p1',
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

describe('buildTravelPlan', () => {
  it('says the stock is enough when it covers the trip and the week after', () => {
    // given
    const products = [product({ id: 'p1', stock: 30 })];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule()],
      DEPARTURE,
      RETURN_DAY,
      context,
    );

    // then
    expect(plan).toEqual([
      {
        id: 'p1',
        name: 'Product',
        title: 'Product',
        pack: '7 szt.',
        verdict: 'enough',
        runOutOffsetDays: 29.5,
      },
    ]);
  });

  it('warns when the stock runs out during the trip', () => {
    // given
    const products = [product({ id: 'p1', unit: 'tablet', stock: 5 })];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule()],
      DEPARTURE,
      RETURN_DAY,
      context,
    );

    // then
    expect(plan[0]).toMatchObject({
      pack: '7 tabl.',
      verdict: 'runsOutDuringTrip',
    });
  });

  it('warns when the stock runs out right after the return', () => {
    // given
    const products = [product({ id: 'p1', stock: 12 })];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule()],
      DEPARTURE,
      RETURN_DAY,
      context,
    );

    // then
    expect(plan[0].verdict).toBe('runsOutAfterReturn');
  });

  it('counts only the days the schedule is active during the trip', () => {
    // given
    const products = [product({ id: 'p1', stock: 100 })];
    const endsMidTrip = schedule({ endDate: new Date(2026, 0, 13) });

    // when
    const plan = buildTravelPlan(
      products,
      [endsMidTrip],
      DEPARTURE,
      RETURN_DAY,
      context,
    );

    // then
    expect(plan[0].pack).toBe('3 szt.');
    expect(plan[0].verdict).toBe('enough');
  });

  it('shows only the packing amount when the stock is not tracked', () => {
    // given
    const products = [product({ id: 'p1', stock: null })];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule({ timesOfDay: ['08:00', '20:00'] })],
      DEPARTURE,
      RETURN_DAY,
      context,
    );

    // then
    expect(plan[0]).toMatchObject({
      pack: '14 szt.',
      verdict: null,
      runOutOffsetDays: null,
    });
  });

  it('gives the run-out moment in days since the morning of departure', () => {
    // given
    const products = [product({ id: 'p1', unit: 'tablet', stock: 5 })];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule()],
      DEPARTURE,
      RETURN_DAY,
      context,
    );

    // then
    expect(plan[0].runOutOffsetDays).toBe(4.5);
  });

  it('keeps the product name without strength next to the full title', () => {
    // given
    const products = [
      product({ id: 'p1', name: 'Euthyrox', strength: '50 µg' }),
    ];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule()],
      DEPARTURE,
      RETURN_DAY,
      context,
    );

    // then
    expect(plan[0]).toMatchObject({
      name: 'Euthyrox',
      title: 'Euthyrox 50 µg',
    });
  });

  it('skips archived products and products without a schedule', () => {
    // given
    const products = [
      product({ id: 'p1', status: 'archived' }),
      product({ id: 'p2' }),
    ];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule({ productId: 'p1' })],
      DEPARTURE,
      RETURN_DAY,
      context,
    );

    // then
    expect(plan).toEqual([]);
  });
});
