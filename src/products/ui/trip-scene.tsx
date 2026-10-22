import { useWindowDimensions, View } from 'react-native';

import { useNow } from '@/commons/ui/use-now';
import { dayPhases } from '@/doses/dose-service';
import { useSunCoords } from '@/location/ui/use-sun-coords';
import type { TravelPlanEntry } from '@/products/product-service';
import { tripRibbons } from '@/products/trip-ribbons';
import {
  ribbonPanelHeight,
  TripRibbonsPanel,
} from '@/products/ui/trip-ribbons-panel';
import { ROAD_PANEL_TOP, roadAxis, skyScene } from '@/scene/scene-service';
import { RoadScene } from '@/scene/ui/road-scene';
import { useEntryProgress } from '@/scene/ui/use-entry-progress';
import { useSceneClock } from '@/scene/ui/use-scene-clock';
import { useSeason } from '@/scene/ui/use-season';

const SCENE_BOTTOM_GAP = 14;

type Props = {
  entries: TravelPlanEntry[];
  tripDays: number;
  replayKey: string;
};

export function TripScene({ entries, tripDays, replayKey }: Props) {
  const now = useNow();
  const coords = useSunCoords();
  const season = useSeason(now);
  const { width } = useWindowDimensions();
  const { time, active, reduceMotion } = useSceneClock();
  const entry = useEntryProgress(replayKey);
  const ribbons = tripRibbons(entries, tripDays);
  const height = ROAD_PANEL_TOP + ribbonPanelHeight(ribbons) + SCENE_BOTTOM_GAP;

  return (
    <View style={{ height }}>
      <RoadScene
        scene={skyScene(now, dayPhases(now, coords), true)}
        season={season}
        tripDays={tripDays}
        height={height}
        time={time}
        entry={entry}
        active={active}
        reduceMotion={reduceMotion}
      />
      {ribbons.ribbons.length > 0 ? (
        <TripRibbonsPanel
          ribbons={ribbons}
          axis={roadAxis(width, tripDays)}
          time={time}
          entry={entry}
        />
      ) : null}
    </View>
  );
}
