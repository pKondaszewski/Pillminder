import type { AdherenceReport } from '@/doses/dose-service';
import type { Product } from '@/products/product-service';

import { buildPeriodReport } from '../period-report';

function product(overrides: Partial<Product> & { id: string }): Product {
  return {
    name: 'Product',
    category: 'medication',
    strength: null,
    status: 'active',
    ...overrides,
  } as Product;
}

function counts(taken: number, due: number, upcoming = 0) {
  return {
    taken,
    skipped: 0,
    missed: due - taken,
    upcoming,
    due,
    rate: due === 0 ? null : taken / due,
  };
}

describe('buildPeriodReport', () => {
  it('lists only products with doses in the period, archived ones included', () => {
    // given
    const products = [
      product({ id: 'a', name: 'Aspirin' }),
      product({ id: 'b', name: 'Biotin', status: 'archived' }),
      product({ id: 'c', name: 'Calcium' }),
    ];
    const report: AdherenceReport = {
      total: counts(5, 8),
      byProduct: { a: counts(3, 4), b: counts(2, 4) },
    };

    // when
    const result = buildPeriodReport(products, report, 'en');

    // then
    expect(result.map((p) => [p.id, p.isArchived])).toEqual([
      ['a', false],
      ['b', true],
    ]);
  });

  it('exposes taken of due, rate and upcoming per product', () => {
    // given
    const products = [product({ id: 'a', name: 'Aspirin' })];
    const report: AdherenceReport = {
      total: counts(22, 30, 3),
      byProduct: { a: counts(22, 30, 3) },
    };

    // when
    const result = buildPeriodReport(products, report, 'en');

    // then
    expect(result[0]).toMatchObject({
      taken: 22,
      due: 30,
      upcoming: 3,
      rate: 22 / 30,
    });
  });

  it('puts archived products last, then sorts by title', () => {
    // given
    const products = [
      product({ id: 'z', name: 'Zinc' }),
      product({ id: 'a', name: 'Aloe', status: 'archived' }),
      product({ id: 'm', name: 'Magnesium' }),
    ];
    const report: AdherenceReport = {
      total: counts(3, 3),
      byProduct: { z: counts(1, 1), a: counts(1, 1), m: counts(1, 1) },
    };

    // when
    const result = buildPeriodReport(products, report, 'en');

    // then
    expect(result.map((p) => p.id)).toEqual(['m', 'z', 'a']);
  });

  it('ignores report entries whose product no longer exists', () => {
    // given
    const report: AdherenceReport = {
      total: counts(1, 1),
      byProduct: { gone: counts(1, 1) },
    };

    // when
    const result = buildPeriodReport([], report, 'en');

    // then
    expect(result).toEqual([]);
  });

  it('has a null rate when nothing is due yet', () => {
    // given
    const products = [product({ id: 'a' })];
    const report: AdherenceReport = {
      total: counts(0, 0, 2),
      byProduct: { a: counts(0, 0, 2) },
    };

    // when
    const result = buildPeriodReport(products, report, 'en');

    // then
    expect(result[0]).toMatchObject({ rate: null, upcoming: 2 });
  });
});
