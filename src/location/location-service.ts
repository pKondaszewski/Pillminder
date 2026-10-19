import * as Location from 'expo-location';

import { createLogger } from '@/config/logger';
import {
  clearLocation,
  getStoredLocation,
  saveLocation,
} from '@/settings/settings-service';

import type { Coords } from './dto/coords';
import type { LocationPermission } from './dto/location-permission';
import { isLocationStale, roundCoords } from './location-helper';

export type { LocationPermission } from './dto/location-permission';

const log = createLogger('location-service');

export async function getLocationPermission(): Promise<LocationPermission> {
  return toPermission(await Location.getForegroundPermissionsAsync());
}

export async function enableLocation(now: number): Promise<LocationPermission> {
  const permission = await requestLocationPermission();
  if (permission.granted) await storeCurrentCoords(now);
  return permission;
}

export async function refreshLocation(now: number): Promise<void> {
  const stored = getStoredLocation();
  if (!stored) return;
  try {
    const { granted } = await getLocationPermission();
    if (!granted) return clearLocation();
    if (!isLocationStale(stored, now)) return;
    await storeCurrentCoords(now);
  } catch (err) {
    // The saved coordinates stay valid, the refresh simply waits for the next start
    log.error('Location refresh failed', err);
  }
}

async function requestLocationPermission(): Promise<LocationPermission> {
  return toPermission(await Location.requestForegroundPermissionsAsync());
}

function toPermission({
  granted,
  canAskAgain,
}: LocationPermission): LocationPermission {
  return { granted, canAskAgain };
}

async function storeCurrentCoords(now: number): Promise<void> {
  saveLocation(await readApproximateCoords(), now);
}

async function readApproximateCoords(): Promise<Coords> {
  const { coords } = await Location.getCurrentPositionAsync({
    accuracy: Location.Accuracy.Low,
  });
  return roundCoords(coords);
}
