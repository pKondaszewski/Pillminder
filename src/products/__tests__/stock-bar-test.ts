import { isStockBarLow, stockBarFill } from '../stock-bar';

describe('stockBarFill', () => {
  it.each([
    [45, 1],
    [30, 1],
    [15, 0.5],
    [0, 0],
  ])('fills the bar for %s days left to %s', (daysLeft, fill) => {
    // when
    const result = stockBarFill(daysLeft);

    // then
    expect(result).toBe(fill);
  });

  it('never goes below empty', () => {
    // when
    const result = stockBarFill(-2);

    // then
    expect(result).toBe(0);
  });
});

describe('isStockBarLow', () => {
  it.each([
    [6, true],
    [7, false],
    [20, false],
  ])('for %s days left returns %s', (daysLeft, low) => {
    // when
    const result = isStockBarLow(daysLeft);

    // then
    expect(result).toBe(low);
  });
});
