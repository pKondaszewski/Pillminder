import { sunTimes } from '../sun-times';

const WARSAW = { latitude: 52.23, longitude: 21.01 };
const SVALBARD = { latitude: 78.2, longitude: 15.6 };
const TOLERANCE_MS = 3 * 60 * 1000;

function utc(iso: string): number {
  return new Date(iso).getTime();
}

// Reference values: timeanddate.com for Warsaw (CEST = UTC+2, CET = UTC+1)
describe('sunTimes', () => {
  it('matches Warsaw at the summer solstice', () => {
    // given
    const date = new Date(2026, 5, 21);

    // when
    const result = sunTimes(date, WARSAW);

    // then
    expect(result).not.toBeNull();
    expect(
      Math.abs(result!.sunrise.getTime() - utc('2026-06-21T04:14:00+02:00')),
    ).toBeLessThanOrEqual(TOLERANCE_MS);
    expect(
      Math.abs(result!.sunset.getTime() - utc('2026-06-21T21:00:00+02:00')),
    ).toBeLessThanOrEqual(TOLERANCE_MS);
  });

  it('matches Warsaw at the winter solstice', () => {
    // given
    const date = new Date(2026, 11, 21);

    // when
    const result = sunTimes(date, WARSAW);

    // then
    expect(result).not.toBeNull();
    expect(
      Math.abs(result!.sunrise.getTime() - utc('2026-12-21T07:42:00+01:00')),
    ).toBeLessThanOrEqual(TOLERANCE_MS);
    expect(
      Math.abs(result!.sunset.getTime() - utc('2026-12-21T15:26:00+01:00')),
    ).toBeLessThanOrEqual(TOLERANCE_MS);
  });

  it('puts solar noon between sunrise and sunset', () => {
    // given
    const date = new Date(2026, 8, 10);

    // when
    const result = sunTimes(date, WARSAW);

    // then
    expect(result!.sunrise.getTime()).toBeLessThan(result!.noon.getTime());
    expect(result!.noon.getTime()).toBeLessThan(result!.sunset.getTime());
  });

  it('gives a day of about 12 hours on the equator at the equinox', () => {
    // given
    const date = new Date(2026, 2, 20);

    // when
    const result = sunTimes(date, { latitude: 0, longitude: 0 });

    // then
    const hours =
      (result!.sunset.getTime() - result!.sunrise.getTime()) / 3_600_000;
    expect(hours).toBeCloseTo(12.1, 0);
  });

  it.each([
    ['polar night', new Date(2026, 11, 21)],
    ['polar day', new Date(2026, 5, 21)],
  ])('returns null during %s', (_name, date) => {
    // when
    const result = sunTimes(date, SVALBARD);

    // then
    expect(result).toBeNull();
  });
});
