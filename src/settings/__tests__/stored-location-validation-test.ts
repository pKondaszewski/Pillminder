import { isValidStoredLocation } from '../stored-location-validation';

describe('isValidStoredLocation', () => {
  it.each([
    [null, true],
    [{ latitude: 52.2, longitude: 21, savedAt: 1 }, true],
    [{ latitude: 91, longitude: 21, savedAt: 1 }, false],
    [{ latitude: 52.2, longitude: -181, savedAt: 1 }, false],
    [{ latitude: 52.2, longitude: 21 }, false],
    [{ latitude: '52.2', longitude: 21, savedAt: 1 }, false],
    [{ latitude: NaN, longitude: 21, savedAt: 1 }, false],
    ['52.2,21', false],
    [undefined, false],
  ])('validates %j as %s', (value, expected) => {
    // when
    const result = isValidStoredLocation(value);

    // then
    expect(result).toBe(expected);
  });
});
