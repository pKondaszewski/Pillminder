import { adjustedStock } from '../intake-stock';

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
