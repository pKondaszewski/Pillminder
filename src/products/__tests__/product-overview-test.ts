import type { Product } from '@/products/product-service';
import type { Schedule } from '@/schedules/schedule-service';

import {
  buildProductOverview,
  type ProductOverviewContext,
} from '../product-overview';

const NOW = new Date(2026, 0, 10, 12, 0);

const MESSAGES: Record<string, string> = {
  'category.medication': 'Lek',
  'category.supplement': 'Suplement',
  'category.care': 'Pielęgnacja',
  'schedule.daily': 'Codziennie',
  'schedule.everyXDays': 'Co {{days}} dni',
  'schedule.quantityValue': '{{count}} na dawkę',
  'products.lowStock': 'Niski zapas',
  'overview.noRhythm': 'Brak harmonogramu',
  'overview.stockUnknown': 'Zapas nie jest śledzony',
  'overview.stockUnits': 'Zapas: {{count}} szt.',
  'overview.stockDaysLeft': 'starczy na ~{{days}} d',
  'overview.stockAmount': 'Zapas: {{amount}}',
  'schedule.amountValue': '{{amount}} na dawkę',
  'unit.tablet': '{{count}} tabl.',
};

const context: ProductOverviewContext = {
  t: (key, options = {}) =>
    Object.entries(options).reduce(
      (text, [name, value]) => text.replace(`{{${name}}}`, String(value)),
      MESSAGES[key] ?? key,
    ),
  formatDate: (date) => date.toISOString().slice(0, 10),
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

function schedule(
  productId: string,
  overrides: Partial<Schedule> = {},
): Schedule {
  return {
    id: `${productId}-schedule`,
    productId,
    intervalDays: 1,
    timesOfDay: ['08:00'],
    quantity: 1,
    startDate: null,
    endDate: null,
    ...overrides,
  } as Schedule;
}

describe('buildProductOverview', () => {
  it('returns an empty list when there are no active products', () => {
    // given
    const products = [product({ id: 'a', status: 'archived' })];

    // when
    const summary = buildProductOverview(products, [], context);

    // then
    expect(summary).toEqual({ products: [] });
  });

  it('describes label, category, rhythm and stock of an active product', () => {
    // given
    const products = [
      product({ id: 'a', name: 'Euthyrox', strength: '50 mcg', stock: 60 }),
    ];
    const schedules = [schedule('a', { timesOfDay: ['08:00', '20:00'] })];

    // when
    const [entry] = buildProductOverview(products, schedules, context).products;

    // then
    expect(entry).toEqual({
      id: 'a',
      title: 'Euthyrox 50 mcg',
      category: 'Lek',
      rhythm: ['Codziennie · 08:00, 20:00'],
      stock: { text: 'Zapas: 60 szt. · starczy na ~30 d', isLow: false },
    });
  });

  it('shows stock and quantity per dose in the product unit', () => {
    // given
    const products = [product({ id: 'a', stock: 60, unit: 'tablet' })];
    const schedules = [schedule('a', { quantity: 2 })];

    // when
    const [entry] = buildProductOverview(products, schedules, context).products;

    // then
    expect(entry.rhythm).toEqual(['Codziennie · 08:00 · 2 tabl. na dawkę']);
    expect(entry.stock.text).toBe('Zapas: 60 tabl. · starczy na ~30 d');
  });

  it('flags low stock', () => {
    // given
    const products = [product({ id: 'a', stock: 3 })];
    const schedules = [schedule('a')];

    // when
    const [entry] = buildProductOverview(products, schedules, context).products;

    // then
    expect(entry.stock).toEqual({
      text: 'Zapas: 3 szt. · starczy na ~3 d · Niski zapas',
      isLow: true,
    });
  });

  it('shows placeholders for a product without schedules and without stock', () => {
    // given
    const products = [product({ id: 'a' })];

    // when
    const [entry] = buildProductOverview(products, [], context).products;

    // then
    expect(entry.rhythm).toEqual(['Brak harmonogramu']);
    expect(entry.stock).toEqual({
      text: 'Zapas nie jest śledzony',
      isLow: false,
    });
  });

  it('lists every schedule of a product ordered by first time', () => {
    // given
    const products = [product({ id: 'a' })];
    const schedules = [
      schedule('a', { id: 's1', timesOfDay: ['21:00'] }),
      schedule('a', { id: 's2', intervalDays: 3, timesOfDay: ['09:00'] }),
      schedule('b'),
    ];

    // when
    const [entry] = buildProductOverview(products, schedules, context).products;

    // then
    expect(entry.rhythm).toEqual(['Co 3 dni · 09:00', 'Codziennie · 21:00']);
  });

  it('orders by category, custom categories last, then by name regardless of input order', () => {
    // given
    const products = [
      product({ id: '1', name: 'Zeta', category: 'Moja' }),
      product({ id: '2', name: 'Beta', category: 'care' }),
      product({ id: '3', name: 'Żyrafa', category: 'medication' }),
      product({ id: '4', name: 'Alfa', category: 'supplement' }),
      product({ id: '5', name: 'Zinc', category: 'medication' }),
    ];

    // when
    const forward = buildProductOverview(products, [], context);
    const reversed = buildProductOverview([...products].reverse(), [], context);

    // then
    expect(forward.products.map((p) => p.title)).toEqual([
      'Zinc',
      'Żyrafa',
      'Alfa',
      'Beta',
      'Zeta',
    ]);
    expect(reversed).toEqual(forward);
  });

  it('shows a custom category as typed by the user', () => {
    // given
    const products = [product({ id: 'a', category: 'Zioła' })];

    // when
    const [entry] = buildProductOverview(products, [], context).products;

    // then
    expect(entry.category).toBe('Zioła');
  });
});
