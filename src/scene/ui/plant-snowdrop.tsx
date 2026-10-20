import { BlurMask, Circle, Group, Path } from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import { ellipsePath } from '@/scene/scene-service';
import {
  EdgedPath,
  Leaf,
  type PlantProps,
  usePlantTone,
} from '@/scene/ui/plant-parts';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const STEM = 'M0 0Q0 -18 2 -24Q5 -27 6.5 -22';
const STEM_WIDTH = 1.6;
const CALYX = ellipsePath(6.5, -21.5, 1.4, 1);
const CLOSED_BELL = 'M0 0Q3.4 3 2.2 7.5Q0 10 -2.2 7.5Q-3.4 3 0 0Z';
const BELL_PETAL = ellipsePath(0, 6, 2.6, 6);
const BELL_CORE = ellipsePath(0, 5, 2.4, 3.6);
const BELL_MARK = 'M-1.6 7.6Q0 5.6 1.6 7.6Q0 8.8 -1.6 7.6Z';
const HALO_BLUR = 6;
const HALO_BASE = 0.35;
const HALO_PULSE = 0.3;
const SPREAD_BASE = 0.55;
const SPREAD_PULSE = 0.08;
const PETAL_SIDES = [-1, 0, 1];

export function Snowdrop({ status, wave }: PlantProps) {
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
      <Leaf x={0} y={-1} length={14} angle={-1.3} color={stem} />
      <Leaf x={0} y={-1} length={12} angle={-1.95} color={stem} />
      <Path path={CALYX} color={stem} />
      <Group transform={[{ translateX: 6.5 }, { translateY: -20 }]}>
        {status === 'overdue' ? (
          <OpenBell wave={wave} />
        ) : (
          <EdgedPath
            path={CLOSED_BELL}
            fill={tone(palette.petal)}
            edge={tone(palette.petalEdge)}
          />
        )}
      </Group>
    </>
  );
}

function OpenBell({ wave }: { wave: SharedValue<number> }) {
  const theme = useTheme();
  const palette = useScenePalette();
  const haloOpacity = useDerivedValue(
    () => HALO_BASE + HALO_PULSE * (0.5 + 0.5 * wave.value),
  );

  return (
    <>
      <Circle cx={0} cy={5} r={10} color={theme.overdue} opacity={haloOpacity}>
        <BlurMask blur={HALO_BLUR} style="normal" />
      </Circle>
      {PETAL_SIDES.map((side) => (
        <BellPetal key={side} side={side} wave={wave} />
      ))}
      <EdgedPath
        path={BELL_CORE}
        fill={palette.petal}
        edge={palette.petalEdge}
      />
      <Path path={BELL_MARK} color={theme.overdue} />
    </>
  );
}

function BellPetal({
  side,
  wave,
}: {
  side: number;
  wave: SharedValue<number>;
}) {
  const palette = useScenePalette();
  const transform = useDerivedValue(() => [
    {
      rotate: side * (SPREAD_BASE + SPREAD_PULSE * (0.5 + 0.5 * wave.value)),
    },
  ]);

  return (
    <Group transform={transform}>
      <EdgedPath
        path={BELL_PETAL}
        fill={palette.petal}
        edge={palette.petalEdge}
      />
    </Group>
  );
}
