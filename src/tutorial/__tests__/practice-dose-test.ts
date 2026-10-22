import type { Product } from '@/products/product-service';

import { newestProduct, practiceDose } from '../practice-dose';

describe('practiceDose', () => {
  it('describes a pending dose of the product at the given time', () => {
    // given
    const product = {
      id: 'product-1',
      name: 'Vitamin D',
      strength: '2000 IU',
      category: 'supplement',
      unit: 'tablet',
      fasting: false,
      profileImageFileName: null,
    } as Product;
    const plannedAt = new Date(2026, 0, 10, 12, 1);

    // when
    const result = practiceDose(product, plannedAt);

    // then
    expect(result).toMatchObject({
      productId: 'product-1',
      productName: 'Vitamin D 2000 IU',
      plannedAt,
      state: 'pending',
      quantity: 1,
    });
  });
});

describe('newestProduct', () => {
  it('picks the most recently created product regardless of order or category', () => {
    // given
    const products = [
      { id: 'a', category: 'supplement', createdAt: new Date(2026, 0, 3) },
      { id: 'b', category: 'medication', createdAt: new Date(2026, 0, 9) },
      { id: 'c', category: 'care', createdAt: new Date(2026, 0, 5) },
    ] as Product[];

    // when
    const result = newestProduct(products);

    // then
    expect(result?.id).toBe('b');
  });

  it('returns undefined without products', () => {
    // when
    const result = newestProduct([]);

    // then
    expect(result).toBeUndefined();
  });
});
