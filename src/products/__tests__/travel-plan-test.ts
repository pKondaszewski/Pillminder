import en from '@/config/i18n/locales/en.json';
import pl from '@/config/i18n/locales/pl.json';
import type { Translate } from '@/config/translate';
import type { Product } from '@/products/product-service';
import type { Schedule } from '@/schedules/schedule-service';

import { buildTravelPlan, type TravelPlanContext } from '../travel-plan';

const NOW = new Date(2026, 0, 10, 12, 0);
const DEPARTURE = new Date(2026, 0, 11);
const RETURN_DAY = new Date(2026, 0, 17);

const MESSAGES: Record<string, string> = {
  'travel.pack': 'Spakuj: {{amount}}',
  'travel.pieces': '{{count}} szt.',
  'unit.tablet': '{{count}} tabl.',
};

function translatorFor(language: 'pl' | 'en'): Translate {
  const locale = language === 'pl' ? pl : en;
  const messages = {
    ...flatten('travel', locale.travel),
    ...flatten('unit', locale.unit),
  };
  const plurals = new Intl.PluralRules(language);
  return (key, options = {}) => {
    const form =
      typeof options.count === 'number'
        ? `${key}_${plurals.select(options.count)}`
        : key;
    return Object.entries(options).reduce(
      (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
      messages[form] ?? messages[key] ?? key,
    );
  };
}

function flatten(
  prefix: string,
  entries: Record<string, string>,
): Record<string, string> {
  return Object.fromEntries(
    Object.entries(entries).map(([name, text]) => [`${prefix}.${name}`, text]),
  );
}

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
    profileImageFileName: null,
    unit: null,
    packSize: null,
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
    rhythmAnchor: null,
    rhythmPausedDays: 0,
    timesOfDay: ['08:00'],
    quantity: 1,
    steps: null,
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
        category: 'medication',
        profileImageFileName: null,
        title: 'Product',
        pack: 'Spakuj: 7 szt.',
        verdict: 'enough',
        runOutOffsetDays: 29.5,
      },
    ]);
  });

  it('carries what the avatar needs', () => {
    // given
    const products = [
      product({
        id: 'p1',
        category: 'supplement',
        profileImageFileName: 'p1.jpg',
      }),
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
      category: 'supplement',
      profileImageFileName: 'p1.jpg',
    });
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
      pack: 'Spakuj: 7 tabl.',
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
    expect(plan[0].pack).toBe('Spakuj: 3 szt.');
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
      pack: 'Spakuj: 14 szt.',
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

  it.each([
    [14, 'Spakuj: 1 opakowanie (14 psiknięć)'],
    [7, 'Spakuj: 2 opakowania (14 psiknięć)'],
    [3, 'Spakuj: 5 opakowań (14 psiknięć)'],
  ])(
    'packs a container in whole packs of %i sprays in Polish',
    (packSize, expected) => {
      // given
      const products = [
        product({ id: 'p1', category: 'nasal-spray', unit: 'spray', packSize }),
      ];

      // when
      const plan = buildTravelPlan(
        products,
        [schedule({ quantity: 2 })],
        DEPARTURE,
        RETURN_DAY,
        { ...context, t: translatorFor('pl') },
      );

      // then
      expect(plan[0].pack).toBe(expected);
    },
  );

  it.each([
    [14, 'Pack: 1 pack (14 sprays)'],
    [7, 'Pack: 2 packs (14 sprays)'],
  ])(
    'packs a container in whole packs of %i sprays in English',
    (packSize, expected) => {
      // given
      const products = [
        product({ id: 'p1', category: 'nasal-spray', unit: 'spray', packSize }),
      ];

      // when
      const plan = buildTravelPlan(
        products,
        [schedule({ quantity: 2 })],
        DEPARTURE,
        RETURN_DAY,
        { ...context, t: translatorFor('en') },
      );

      // then
      expect(plan[0].pack).toBe(expected);
    },
  );

  it('counts eye drop packs in drops, the unit the pack size is stored in', () => {
    // given
    const products = [
      product({
        id: 'p1',
        category: 'eye-drops',
        unit: 'drop',
        packSize: 200,
      }),
    ];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule({ quantity: 30 })],
      DEPARTURE,
      RETURN_DAY,
      { ...context, t: translatorFor('pl') },
    );

    // then
    expect(plan[0].pack).toBe('Spakuj: 2 opakowania (210 kropli)');
  });

  it('packs a reserve for a container without a pack size', () => {
    // given
    const products = [
      product({ id: 'p1', category: 'nasal-spray', unit: 'spray' }),
    ];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule({ quantity: 2 })],
      DEPARTURE,
      RETURN_DAY,
      { ...context, t: translatorFor('pl') },
    );

    // then
    expect(plan[0].pack).toBe('Spakuj zapas na 14 psiknięć');
  });

  it('keeps counting tablets one by one even with a pack size', () => {
    // given
    const products = [product({ id: 'p1', unit: 'tablet', packSize: 10 })];

    // when
    const plan = buildTravelPlan(
      products,
      [schedule()],
      DEPARTURE,
      RETURN_DAY,
      { ...context, t: translatorFor('pl') },
    );

    // then
    expect(plan[0].pack).toBe('Spakuj: 7 tabletek');
  });
});
