import { useSunCoords } from '@/location/ui/use-sun-coords';
import type { Season } from '@/scene/scene-service';
import { resolveSeason } from '@/scene/scene-service';
import { useSettings } from '@/settings/ui/use-settings';

export function useSeason(now: Date): Season {
  const { seasonPreference } = useSettings();
  const coords = useSunCoords();
  return resolveSeason(seasonPreference, now, coords?.latitude ?? null);
}
