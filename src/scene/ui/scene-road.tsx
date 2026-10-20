import {
  DashPathEffect,
  Group,
  Line,
  Oval,
  Path,
  Rect,
} from '@shopify/react-native-skia';
import { useMemo } from 'react';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import {
  dayStoneDays,
  type RoadAxis,
  roadPath,
  roadX,
  roadY,
  withAlpha,
} from '@/scene/scene-service';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const EDGE_WIDTH = 16;
const SURFACE_WIDTH = 12;
const ROAD_OVERSHOOT = 10;
const CENTER_LINE_ALPHA = 0.25;
const CENTER_LINE_DASH = [5, 6];
const STONE_OFFSET_Y = 12;
const FLAG_CYCLES = 24;
const FLAG_WAVE = 2;
const TWO_PI = 2 * Math.PI;

type Props = {
  width: number;
  axis: RoadAxis;
  tripDays: number;
  time: SharedValue<number>;
};

export function SceneRoad({ width, axis, tripDays, time }: Props) {
  const theme = useTheme();
  const palette = useScenePalette();
  const departureX = roadX(axis, 0);
  const destinationX = roadX(axis, tripDays);
  const road = useMemo(
    () => roadPath(width, -ROAD_OVERSHOOT, width + ROAD_OVERSHOOT),
    [width],
  );
  const centerLine = useMemo(
    () => roadPath(width, departureX, destinationX),
    [width, departureX, destinationX],
  );
  const stones = useMemo(
    () =>
      dayStoneDays(tripDays).map((day) => {
        const x = roadX(axis, day);
        return { day, x, y: roadY(width, x) + STONE_OFFSET_Y };
      }),
    [axis, tripDays, width],
  );

  return (
    <>
      <Path
        path={road}
        style="stroke"
        strokeWidth={EDGE_WIDTH}
        strokeCap="round"
        color={palette.roadEdge}
      />
      <Path
        path={road}
        style="stroke"
        strokeWidth={SURFACE_WIDTH}
        strokeCap="round"
        color={palette.road}
      />
      <Path
        path={centerLine}
        style="stroke"
        strokeWidth={1.4}
        color={withAlpha(theme.text, CENTER_LINE_ALPHA)}
      >
        <DashPathEffect intervals={CENTER_LINE_DASH} />
      </Path>
      {stones.map(({ day, x, y }) => (
        <Oval
          key={day}
          x={x - 3.5}
          y={y - 2.4}
          width={7}
          height={4.8}
          color={theme.surface}
        />
      ))}
      <House x={departureX + 4} y={roadY(width, departureX) - 10} />
      <Tent
        x={destinationX + 16}
        y={roadY(width, destinationX) - 6}
        time={time}
      />
    </>
  );
}

function House({ x, y }: { x: number; y: number }) {
  const palette = useScenePalette();

  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      <Rect x={-14} y={-18} width={24} height={18} color={palette.house} />
      <Path path="M-18 -18L-2 -32L14 -18Z" color={palette.roof} />
      <Rect x={-6} y={-10} width={7} height={10} color={palette.door} />
    </Group>
  );
}

function Tent({
  x,
  y,
  time,
}: {
  x: number;
  y: number;
  time: SharedValue<number>;
}) {
  const theme = useTheme();
  const palette = useScenePalette();
  const flag = useDerivedValue(() => {
    const wave = FLAG_WAVE * Math.sin(TWO_PI * time.value * FLAG_CYCLES);
    return `M0 -36Q6 ${-36 + wave} 11 -33L0 -30Z`;
  });

  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      <Path path="M-14 0L0 -24L14 0Z" color={theme.overdue} />
      <Path path="M-3 0L0 -12L3 0Z" color={palette.tentShade} />
      <Line
        p1={{ x: 0, y: -24 }}
        p2={{ x: 0, y: -36 }}
        color={theme.text}
        strokeWidth={1.2}
      />
      <Path path={flag} color={theme.taken} />
    </Group>
  );
}
