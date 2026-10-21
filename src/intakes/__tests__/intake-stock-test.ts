import { adjustedStock, isValidIntakeQuantity } from '../intake-stock';

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

describe('isValidIntakeQuantity', () => {
  it.each([1, 2, 30])('accepts %i', (quantity) => {
    // when
    const valid = isValidIntakeQuantity(quantity);

    // then
    expect(valid).toBe(true);
  });

  it.each([0, -1, 1.5, NaN])('rejects %p', (quantity) => {
    // when
    const valid = isValidIntakeQuantity(quantity);

    // then
    expect(valid).toBe(false);
  });
});
