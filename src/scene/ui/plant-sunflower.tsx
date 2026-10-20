import { Circle, Group, Path } from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import { ellipseRing, mixColors } from '@/scene/scene-service';
import { Leaf, type PlantProps, usePlantTone } from '@/scene/ui/plant-parts';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const STEM = 'M0 0Q-2 -12 0 -24';
const STEM_WIDTH = 2.2;
const HEAD_Y = -26;
const SEPALS = ellipseRing(8, 3.6, 2.6, 1.3);
const OUTER_PETALS = ellipseRing(12, 6.5, 4, 1.7);
const INNER_PETALS = ellipseRing(12, 6.5, 4, 1.7, 0.5);
const BUD_RADIUS = 3.6;
const CENTER_RADIUS = 4.4;
const CENTER_COLOR = '#6B4A2B';
const SEED_COLOR = '#8C6239';
const SEEDS = [
  [-1.5, -1.2],
  [1.4, -0.6],
  [0, 1.6],
  [-1.6, 1.2],
  [1.8, 1.6],
] as const;
const SEED_RADIUS = 0.6;
const OPEN_PULSE = 0.1;
const OUTER_DARKEN = 0.12;
const INNER_SUN_SHARE = 0.35;
const SEPAL_DARKEN = 0.1;

export function Sunflower({ status, wave }: PlantProps) {
  const palette = useScenePalette();
  const tone = usePlantTone(status);
  const stem = tone(palette.stem);

  return (
    <>
      <Path
        path={STEM}
        color={stem}
        style="stroke"
        strokeWidth={STEM_WIDTH}
        strokeCap="round"
      />
      <Leaf x={0} y={-8} length={11} angle={-0.5} color={stem} />
      <Leaf x={0} y={-13} length={10} angle={-2.6} color={stem} />
      <Group transform={[{ translateY: HEAD_Y }]}>
        {status === 'overdue' ? (
          <OpenHead wave={wave} />
        ) : (
          <>
            <Path
              path={SEPALS}
              color={mixColors(stem, '#000000', SEPAL_DARKEN)}
            />
            <Circle r={BUD_RADIUS} color={tone(palette.bud)} />
          </>
        )}
      </Group>
    </>
  );
}

function OpenHead({ wave }: { wave: SharedValue<number> }) {
  const theme = useTheme();
  const transform = useDerivedValue(() => [
    { scale: 1 + OPEN_PULSE * wave.value },
  ]);

  return (
    <Group transform={transform}>
      <Path
        path={OUTER_PETALS}
        color={mixColors(theme.overdue, '#000000', OUTER_DARKEN)}
      />
      <Path
        path={INNER_PETALS}
        color={mixColors(theme.overdue, theme.sun, INNER_SUN_SHARE)}
      />
      <Circle r={CENTER_RADIUS} color={CENTER_COLOR} />
      {SEEDS.map(([x, y]) => (
        <Circle
          key={`${x}:${y}`}
          cx={x}
          cy={y}
          r={SEED_RADIUS}
          color={SEED_COLOR}
        />
      ))}
    </Group>
  );
}
