import { filterProductsByName, sortProductsByName } from '../product-picker';
import type { Product } from '../product-service';

const product = (id: string, name: string) => ({ id, name }) as Product;

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
