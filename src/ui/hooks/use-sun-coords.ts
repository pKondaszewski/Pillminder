import type { Coords } from '@/location/dto/coords';

import { useSettings } from './use-settings';

export function useSunCoords(): Coords | null {
  return useSettings().location;
}
