import {
  isLocationStale,
  LOCATION_MAX_AGE_MS,
  roundCoords,
} from '../location-helper';

describe('roundCoords', () => {
  it('rounds both values to one decimal place', () => {
    // when
    const result = roundCoords({ latitude: 52.2297, longitude: 21.0122 });

    // then
    expect(result).toEqual({ latitude: 52.2, longitude: 21 });
  });

  it('rounds negative values', () => {
    // when
    const result = roundCoords({ latitude: -33.8688, longitude: -70.6693 });

    // then
    expect(result).toEqual({ latitude: -33.9, longitude: -70.7 });
  });
});

describe('isLocationStale', () => {
  const location = { latitude: 52.2, longitude: 21, savedAt: 1_000_000 };

  it('is fresh up to 30 days', () => {
    // when
    const result = isLocationStale(location, 1_000_000 + LOCATION_MAX_AGE_MS);

    // then
    expect(result).toBe(false);
  });

  it('is stale after 30 days', () => {
    // when
    const result = isLocationStale(
      location,
      1_000_000 + LOCATION_MAX_AGE_MS + 1,
    );

    // then
    expect(result).toBe(true);
  });
});
