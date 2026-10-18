import type { StoredLocation } from '@/location/dto/coords';

export function isValidStoredLocation(
  value: unknown,
): value is StoredLocation | null {
  if (value === null) return true;
  if (typeof value !== 'object') return false;
  const { latitude, longitude, savedAt } = value as Record<string, unknown>;
  return (
    isFiniteWithin(latitude, 90) &&
    isFiniteWithin(longitude, 180) &&
    typeof savedAt === 'number' &&
    Number.isFinite(savedAt)
  );
}

function isFiniteWithin(value: unknown, limit: number): boolean {
  return typeof value === 'number' && Math.abs(value) <= limit;
}
