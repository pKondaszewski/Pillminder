import {
  categoryFilterIfListed,
  filterProducts,
  filterProductsByName,
  listedCategories,
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
  const noFilters = { query: '', category: null, status: null };

  it('returns everything when no filter is set', () => {
    // when
    const result = filterProducts(products, noFilters);

    // then
    expect(result).toHaveLength(3);
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

describe('listedCategories', () => {
  it('returns each category present on the list once', () => {
    // given
    const products = [
      product('1', 'A', 'supplement'),
      product('2', 'B', 'Herbs'),
      product('3', 'C', 'supplement'),
    ];

    // when
    const result = listedCategories(products);

    // then
    expect(result).toEqual(['supplement', 'Herbs']);
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
