import { BlurMask, Circle, Group, Path } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import { ellipsePath } from '@/scene/scene-service';
import { type PlantProps, usePlantTone } from '@/scene/ui/plant-parts';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const STONE = ellipsePath(0, -4, 8, 5.5);
const SNOW_CAP = 'M-6.5 -8A5.5 2 0 0 1 4.5 -8Z';
const SNOW_CAP_ORIGIN = { x: -1, y: -8 };
const SNOW_CAP_TILT = -0.1;
const SNOW_COLOR = '#FFFFFF';
const SNOW_OPACITY = 0.9;
const GLOW_RADIUS = 12;
const GLOW_BLUR = 6;
const GLOW_BASE = 0.35;
const GLOW_PULSE = 0.25;

export function Pebble({ status, wave }: PlantProps) {
  const theme = useTheme();
  const palette = useScenePalette();
  const tone = usePlantTone(status);
  const due = status === 'overdue';
  const glowOpacity = useDerivedValue(
    () => GLOW_BASE + GLOW_PULSE * wave.value,
  );

  return (
    <>
      {due ? (
        <Circle
          cy={-4}
          r={GLOW_RADIUS}
          color={theme.overdue}
          opacity={glowOpacity}
        >
          <BlurMask blur={GLOW_BLUR} style="normal" />
        </Circle>
      ) : null}
      <Path path={STONE} color={due ? theme.overdue : tone(palette.stone)} />
      <Group
        transform={[{ rotate: SNOW_CAP_TILT }]}
        origin={SNOW_CAP_ORIGIN}
        opacity={SNOW_OPACITY}
      >
        <Path path={SNOW_CAP} color={tone(SNOW_COLOR)} />
      </Group>
    </>
  );
}
