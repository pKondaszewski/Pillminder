import type { ReorderStatus } from '../dto/reorder-status';
import {
  categoryFilterIfListed,
  DEFAULT_PRODUCT_FILTERS,
  filterableCategories,
  filterProducts,
  filterProductsByName,
  mostUrgentLowStock,
  sortProductsByName,
  sortProductsByStatusThenName,
} from '../product-list';
import type { Product } from '../product-service';

const product = (
  id: string,
  name: string,
  category = 'medication',
  status: Product['status'] = 'active',
) => ({ id, name, category, status }) as Product;

describe('sortProductsByName', () => {
  it('sorts alphabetically ignoring case and respecting the locale', () => {
    // given
    const products = [
      product('1', 'żelazo'),
      product('2', 'Zinc'),
      product('3', 'apap'),
    ];

    // when
    const result = sortProductsByName(products, 'pl');

    // then
    expect(result.map((p) => p.name)).toEqual(['apap', 'Zinc', 'żelazo']);
  });

  it('breaks ties by id and does not mutate the input', () => {
    // given
    const products = [product('b', 'Iron'), product('a', 'Iron')];

    // when
    const result = sortProductsByName(products, 'en');

    // then
    expect(result.map((p) => p.id)).toEqual(['a', 'b']);
    expect(products.map((p) => p.id)).toEqual(['b', 'a']);
  });
});

describe('filterProductsByName', () => {
  const products = [product('1', 'Vitamin D'), product('2', 'Magnesium')];

  it('matches a substring case-insensitively', () => {
    // when
    const result = filterProductsByName(products, 'MIN');

    // then
    expect(result.map((p) => p.id)).toEqual(['1']);
  });

  it('returns everything for a blank query', () => {
    // when
    const result = filterProductsByName(products, '  ');

    // then
    expect(result).toHaveLength(2);
  });

  it('returns nothing when no name matches', () => {
    // when
    const result = filterProductsByName(products, 'zzz');

    // then
    expect(result).toEqual([]);
  });
});

describe('sortProductsByStatusThenName', () => {
  it('puts archived products last and sorts by name within a status', () => {
    // given
    const products = [
      product('1', 'Zinc', 'supplement', 'archived'),
      product('2', 'Iron'),
      product('3', 'Apap'),
      product('4', 'Aloe', 'care', 'archived'),
    ];

    // when
    const result = sortProductsByStatusThenName(products, 'en');

    // then
    expect(result.map((p) => p.name)).toEqual(['Apap', 'Iron', 'Aloe', 'Zinc']);
  });
});

describe('filterProducts', () => {
  const products = [
    product('1', 'Vitamin D', 'supplement'),
    product('2', 'Vitamin C', 'supplement', 'archived'),
    product('3', 'Ibuprofen', 'medication'),
  ];
  const noFilters = { ...DEFAULT_PRODUCT_FILTERS, status: 'all' } as const;

  it('returns everything for the all-statuses filter', () => {
    // when
    const result = filterProducts(products, noFilters);

    // then
    expect(result).toHaveLength(3);
  });

  it('hides archived products with the default filters', () => {
    // when
    const result = filterProducts(products, DEFAULT_PRODUCT_FILTERS);

    // then
    expect(result.map((p) => p.id)).toEqual(['1', '3']);
  });

  it('shows only archived products for the archive filter', () => {
    // when
    const result = filterProducts(products, {
      ...noFilters,
      status: 'archived',
    });

    // then
    expect(result.map((p) => p.id)).toEqual(['2']);
  });

  it('combines query, category and status with AND', () => {
    // when
    const result = filterProducts(products, {
      query: 'vitamin',
      category: 'supplement',
      status: 'active',
    });

    // then
    expect(result.map((p) => p.id)).toEqual(['1']);
  });

  it('filters by category alone', () => {
    // when
    const result = filterProducts(products, {
      ...noFilters,
      category: 'medication',
    });

    // then
    expect(result.map((p) => p.id)).toEqual(['3']);
  });
});

describe('filterableCategories', () => {
  it('lists the built-in categories and each custom category once', () => {
    // given
    const products = [
      product('1', 'A', 'supplement'),
      product('2', 'B', 'Herbs'),
      product('3', 'C', 'Herbs'),
    ];

    // when
    const result = filterableCategories(products);

    // then
    expect(result).toEqual([
      'medication',
      'supplement',
      'care',
      'nasal-spray',
      'eye-drops',
      'Herbs',
    ]);
  });
});

describe('categoryFilterIfListed', () => {
  it('keeps a category that is still on the list', () => {
    // when
    const result = categoryFilterIfListed('supplement', [
      'medication',
      'supplement',
    ]);

    // then
    expect(result).toBe('supplement');
  });

  it('drops a category that no longer appears on the list', () => {
    // when
    const result = categoryFilterIfListed('Herbs', ['medication']);

    // then
    expect(result).toBeNull();
  });

  it('keeps no category as no category', () => {
    // when
    const result = categoryFilterIfListed(null, ['medication']);

    // then
    expect(result).toBeNull();
  });
});

describe('mostUrgentLowStock', () => {
  const status = (daysLeft: number | null, isLow: boolean): ReorderStatus => ({
    dailyConsumption: 1,
    daysLeft,
    runOutAt: null,
    reorderAt: null,
    isLow,
  });

  it('picks the low product that runs out first', () => {
    // given
    const products = [product('1', 'Iron'), product('2', 'Zinc')];
    const statuses = { '1': status(5, true), '2': status(2, true) };

    // when
    const result = mostUrgentLowStock(products, statuses);

    // then
    expect(result).toEqual({ product: products[1], daysLeft: 2 });
  });

  it('includes a low product without days left, after those that have them', () => {
    // given
    const products = [product('1', 'Iron'), product('2', 'Zinc')];
    const statuses = { '1': status(null, true), '2': status(9, true) };

    // when
    const result = mostUrgentLowStock(products, statuses);

    // then
    expect(result).toEqual({ product: products[1], daysLeft: 9 });
  });

  it('picks a low product without days left when it is the only one', () => {
    // given
    const products = [product('1', 'Iron')];
    const statuses = { '1': status(null, true) };

    // when
    const result = mostUrgentLowStock(products, statuses);

    // then
    expect(result).toEqual({ product: products[0], daysLeft: null });
  });

  it('ignores products that are not low or have no status', () => {
    // given
    const products = [product('1', 'Iron'), product('2', 'Zinc')];
    const statuses = { '1': status(20, false) };

    // when
    const result = mostUrgentLowStock(products, statuses);

    // then
    expect(result).toBeNull();
  });
});
