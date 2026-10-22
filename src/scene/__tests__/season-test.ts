import { resolveSeason, seasonOf } from '../season';

function inMonth(month: number): Date {
  return new Date(2026, month - 1, 15);
}

describe('seasonOf', () => {
  it.each([
    [1, 'winter'],
    [2, 'winter'],
    [3, 'spring'],
    [5, 'spring'],
    [6, 'summer'],
    [8, 'summer'],
    [9, 'autumn'],
    [11, 'autumn'],
    [12, 'winter'],
  ])('month %i is %s in the north', (month, expected) => {
    // when
    const season = seasonOf(inMonth(month), 52);

    // then
    expect(season).toBe(expected);
  });

  it('assumes the northern hemisphere without a location', () => {
    // when
    const season = seasonOf(inMonth(7), null);

    // then
    expect(season).toBe('summer');
  });

  it.each([
    [1, 'summer'],
    [4, 'autumn'],
    [7, 'winter'],
    [10, 'spring'],
  ])('month %i is %s in the south', (month, expected) => {
    // when
    const season = seasonOf(inMonth(month), -33);

    // then
    expect(season).toBe(expected);
  });

  it('treats the equator as northern', () => {
    // when
    const season = seasonOf(inMonth(1), 0);

    // then
    expect(season).toBe('winter');
  });
});

describe('resolveSeason', () => {
  it.each([
    [52, 'winter'],
    [-33, 'summer'],
  ])('auto follows the date at latitude %i', (latitude, expected) => {
    // when
    const season = resolveSeason('auto', inMonth(1), latitude);

    // then
    expect(season).toBe(expected);
  });

  it('a chosen season ignores the date and latitude', () => {
    // when
    const season = resolveSeason('autumn', inMonth(1), -33);

    // then
    expect(season).toBe('autumn');
  });
});
