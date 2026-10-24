import { sunTimes } from '@/location/sun-times';

import { dayPhases } from '../day-phases';

describe('dayPhases', () => {
  it('returns fixed 06:00, 12:00 and 18:00 of the given day without coordinates', () => {
    // given
    const date = new Date(2026, 9, 10, 15, 42);

    // when
    const phases = dayPhases(date, null);

    // then
    expect(phases).toEqual({
      sunrise: new Date(2026, 9, 10, 6),
      sunset: new Date(2026, 9, 10, 18),
    });
  });

  it('uses sunrise and sunset of the location when coordinates are given', () => {
    // given
    const date = new Date(2026, 5, 21, 15);
    const warsaw = { latitude: 52.23, longitude: 21.01 };

    // when
    const phases = dayPhases(date, warsaw);

    // then
    expect(phases).toEqual(sunTimes(date, warsaw));
    expect(phases.sunrise.getTime()).not.toBe(
      new Date(2026, 5, 21, 6).getTime(),
    );
  });

  it('falls back to fixed hours on polar day', () => {
    // given
    const date = new Date(2026, 5, 21, 15);
    const svalbard = { latitude: 78.2, longitude: 15.6 };

    // when
    const phases = dayPhases(date, svalbard);

    // then
    expect(phases).toEqual({
      sunrise: new Date(2026, 5, 21, 6),
      sunset: new Date(2026, 5, 21, 18),
    });
  });
});
