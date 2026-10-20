import { Group, Path } from '@shopify/react-native-skia';
import type { SharedValue } from 'react-native-reanimated';

import { leafPath, mixColors } from '@/scene/scene-service';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

export type PlantStatus = 'planned' | 'overdue' | 'skipped';

export type PlantProps = {
  status: PlantStatus;
  wave: SharedValue<number>;
};

const WILTED_KEEP = 0.2;
const EDGE_WIDTH = 0.7;

export function usePlantTone(status: PlantStatus): (color: string) => string {
  const palette = useScenePalette();
  return (color) =>
    status === 'skipped'
      ? mixColors(palette.wilted, color, WILTED_KEEP)
      : color;
}

export function Leaf({
  x,
  y,
  length,
  angle,
  color,
}: {
  x: number;
  y: number;
  length: number;
  angle: number;
  color: string;
}) {
  return (
    <Group
      transform={[{ translateX: x }, { translateY: y }, { rotate: angle }]}
    >
      <Path path={leafPath(length)} color={color} />
    </Group>
  );
}

export function EdgedPath({
  path,
  fill,
  edge,
}: {
  path: string;
  fill: string;
  edge: string;
}) {
  return (
    <>
      <Path path={path} color={fill} />
      <Path path={path} color={edge} style="stroke" strokeWidth={EDGE_WIDTH} />
    </>
  );
}
