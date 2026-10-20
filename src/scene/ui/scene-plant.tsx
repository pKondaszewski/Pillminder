import { Group, Path } from '@shopify/react-native-skia';
import type { ComponentType } from 'react';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import {
  ellipsePath,
  type MeadowMark,
  meadowSlot,
  plantGrowth,
  type Season,
} from '@/scene/scene-service';
import { Mushroom } from '@/scene/ui/plant-mushroom';
import type { PlantProps, PlantStatus } from '@/scene/ui/plant-parts';
import { Pebble } from '@/scene/ui/plant-pebble';
import { Snowdrop } from '@/scene/ui/plant-snowdrop';
import { Sunflower } from '@/scene/ui/plant-sunflower';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const SPECIES: Record<Season, ComponentType<PlantProps>> = {
  spring: Snowdrop,
  summer: Sunflower,
  autumn: Mushroom,
  winter: Pebble,
};
const LEFTOVER = ellipsePath(0, -1, 3, 1.4);
const LEFTOVER_OPACITY = 0.6;
const WILTED_TILT = 0.45;
const WILTED_SQUASH = 0.85;
const WILTED_OPACITY = 0.75;

type Placement = { x: number; y: number; scale: number };

const CLUMPS: Record<number, Placement[]> = {
  1: [{ x: 0, y: 0, scale: 1 }],
  2: [
    { x: -6, y: 1, scale: 0.95 },
    { x: 6, y: 1, scale: 0.95 },
  ],
  3: [
    { x: 0, y: -2, scale: 1.1 },
    { x: -8, y: 2, scale: 0.85 },
    { x: 8, y: 2, scale: 0.85 },
  ],
};
const MAX_CLUMP = 3;

type Props = {
  mark: MeadowMark;
  index: number;
  season: Season;
  width: number;
  entry: SharedValue<number>;
  wave: SharedValue<number>;
};

export function ClumpOfPlants({
  size,
  season,
  status,
  wave,
}: {
  size: number;
  season: Season;
  status: PlantStatus;
  wave: SharedValue<number>;
}) {
  const Species = SPECIES[season];
  const wilted = status === 'skipped';

  return (
    <>
      {clumpPlacements(size).map(({ x, y, scale }) => (
        <Group
          key={`${x}:${y}`}
          transform={[{ translateX: x }, { translateY: y }, { scale }]}
          opacity={wilted ? WILTED_OPACITY : 1}
        >
          <Group
            transform={
              wilted ? [{ rotate: WILTED_TILT }, { scaleY: WILTED_SQUASH }] : []
            }
          >
            <Species status={status} wave={wave} />
          </Group>
        </Group>
      ))}
    </>
  );
}

export function MeadowPlant({
  mark,
  index,
  season,
  width,
  entry,
  wave,
}: Props) {
  const palette = useScenePalette();
  const slot = meadowSlot(mark.position, index, width);
  const transform = useDerivedValue(() => [
    { translateX: slot.x },
    { translateY: slot.y },
    { scale: plantGrowth(entry.value, index) },
  ]);

  return (
    <Group transform={transform}>
      {mark.status === 'taken' ? (
        <Path path={LEFTOVER} color={palette.stem} opacity={LEFTOVER_OPACITY} />
      ) : (
        <ClumpOfPlants
          size={mark.size}
          season={season}
          status={mark.status}
          wave={wave}
        />
      )}
    </Group>
  );
}

function clumpPlacements(size: number): Placement[] {
  return CLUMPS[Math.min(size, MAX_CLUMP)];
}
