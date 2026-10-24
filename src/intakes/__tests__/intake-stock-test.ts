import { adjustedStock, deductedQuantity } from '../intake-stock';

describe('adjustedStock', () => {
  it('lowers a tracked stock', () => {
    // when
    const stock = adjustedStock(10, -2);

    // then
    expect(stock).toBe(8);
  });

  it('gives units back', () => {
    // when
    const stock = adjustedStock(8, 2);

    // then
    expect(stock).toBe(10);
  });

  it('never goes below zero', () => {
    // when
    const stock = adjustedStock(1, -3);

    // then
    expect(stock).toBe(0);
  });
});

describe('deductedQuantity', () => {
  it.each<[string, number | null, number | null]>([
    ['enough stock', 10, 3],
    ['too little stock', 1, 1],
    ['empty stock', 0, 0],
    ['untracked stock', null, null],
  ])('with %s and a quantity of 3', (_, stock, expected) => {
    // when
    const deducted = deductedQuantity(stock, 3);

    // then
    expect(deducted).toBe(expected);
  });
});
