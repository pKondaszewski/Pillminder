import { Group, Path, Rect } from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import {
  grassPath,
  GROUND_Y,
  hillPath,
  type HillSpec,
  SCENE_HEIGHT,
  type Season,
} from '@/scene/scene-service';
import { useColorAt } from '@/scene/ui/use-blended-colors';

const HILLS: HillSpec[] = [
  { baseY: 150, amplitude: 9, phase: 0.5, bottomY: SCENE_HEIGHT },
  { baseY: 168, amplitude: 8, phase: 2, bottomY: SCENE_HEIGHT },
  { baseY: 186, amplitude: 6, phase: 4, bottomY: SCENE_HEIGHT },
];
const TUFTS = 3;
const BLADES_PER_TUFT = 16;
const BLADE_HEIGHT = 17;
const TUFT_SEED = 11;
const SWAY_CYCLES = 12;
const SWAY_ANGLE = 0.07;
const FAR_COLOR = 2;
const MID_COLOR = 3;
const NEAR_COLOR = 4;
const GRASS_COLOR = 5;
const TWO_PI = 2 * Math.PI;

type Props = {
  width: number;
  season: Season;
  time: SharedValue<number>;
  colors: SharedValue<string[]>;
};

export function LandscapeLayer({ width, season, time, colors }: Props) {
  const far = useColorAt(colors, FAR_COLOR);
  const mid = useColorAt(colors, MID_COLOR);
  const near = useColorAt(colors, NEAR_COLOR);
  const grass = useColorAt(colors, GRASS_COLOR);
  const hills = [far, mid, near];
  const paths = useMemo(
    () => HILLS.map((hill) => hillPath(width, hill)),
    [width],
  );

  return (
    <>
      {paths.map((path, index) => (
        <Path key={index} path={path} color={hills[index]} />
      ))}
      <Rect
        x={0}
        y={GROUND_Y}
        width={width}
        height={SCENE_HEIGHT - GROUND_Y}
        color={near}
      />
      {season === 'winter'
        ? null
        : Array.from({ length: TUFTS }, (_, index) => (
            <GrassTuft
              key={index}
              index={index}
              width={width / TUFTS}
              color={grass}
              time={time}
            />
          ))}
    </>
  );
}

function GrassTuft({
  index,
  width,
  color,
  time,
}: {
  index: number;
  width: number;
  color: SharedValue<string>;
  time: SharedValue<number>;
}) {
  const path = useMemo(
    () =>
      grassPath(
        width,
        GROUND_Y + 1,
        BLADE_HEIGHT,
        BLADES_PER_TUFT,
        TUFT_SEED + index,
      ),
    [width, index],
  );
  const transform = useDerivedValue(() => [
    {
      skewX:
        SWAY_ANGLE *
        Math.sin(TWO_PI * (time.value * SWAY_CYCLES + index / TUFTS)),
    },
  ]);

  return (
    <Group transform={[{ translateX: width * index }]}>
      <Group transform={transform} origin={{ x: width / 2, y: GROUND_Y }}>
        <Path path={path} color={color} />
      </Group>
    </Group>
  );
}
