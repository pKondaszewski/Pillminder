import { dropsToMl, mlToDrops } from '../eye-drops';

describe('eye drops volume', () => {
  it('converts ml to drops', () => {
    // when
    const result = mlToDrops(10);

    // then
    expect(result).toBe(200);
  });

  it.each([
    [200, 10],
    [210, 11],
    [5, 1],
  ])('converts %s drops to %s ml, at least 1', (drops, expected) => {
    // when
    const result = dropsToMl(drops);

    // then
    expect(result).toBe(expected);
  });
});
