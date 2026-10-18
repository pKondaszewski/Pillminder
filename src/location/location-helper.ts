import type { Coords, StoredLocation } from './dto/coords';

// One decimal is about 10 km: enough for sun times, too coarse to locate anyone
const COORDS_DECIMALS = 1;
// Sun times barely move in a month, so there is no need for background updates
export const LOCATION_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

export function roundCoords({ latitude, longitude }: Coords): Coords {
  const factor = 10 ** COORDS_DECIMALS;
  return {
    latitude: Math.round(latitude * factor) / factor,
    longitude: Math.round(longitude * factor) / factor,
  };
}

export function isLocationStale(
  location: StoredLocation,
  now: number,
): boolean {
  return now - location.savedAt > LOCATION_MAX_AGE_MS;
}
