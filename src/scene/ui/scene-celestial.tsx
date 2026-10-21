import { BlurMask, Circle, Group, Path } from '@shopify/react-native-skia';
import {
  type DerivedValue,
  interpolateColor,
  type SharedValue,
  useDerivedValue,
} from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import {
  bodyPosition,
  rayPath,
  SCENE_BODY_TRAVEL,
  SCENE_HORIZON_Y,
  type SkyScene,
} from '@/scene/scene-service';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const SUN_RADIUS = 14;
const SUN_RAYS = rayPath(12, 22, 30);
const SUN_RAY_WIDTH = 2.5;
const SUN_GLOW_RADIUS = 28;
const SUN_GLOW_PULSE = 5;
const SUN_GLOW_BLUR = 14;
const SUN_GLOW_OPACITY = 0.45;
const MOON_PATH = 'M3 -10A11 11 0 1 0 10 3A8.5 8.5 0 0 1 3 -10Z';
const MOON_SCALE = 1.9;
const MOON_GLOW_RADIUS = 30;
const MOON_GLOW_BLUR = 16;
const MOON_GLOW_BASE = 0.18;
const MOON_GLOW_PULSE = 0.08;
const LOW_SUN_ELEVATION = 0.35;
const BURST_RAYS = rayPath(16, 0.3, 1);
const BURST_START_RADIUS = 24;
const BURST_TRAVEL = 140;
const BURST_STROKE = 3;
const GLOW_CYCLES = 12;
const TWO_PI = 2 * Math.PI;

type Placement = { x: number; y: number; elevation: number };

type Props = {
  scene: SkyScene;
  width: number;
  entry: SharedValue<number>;
  time: SharedValue<number>;
  burst: SharedValue<number>;
};

export function SceneCelestial({ scene, width, entry, time, burst }: Props) {
  const placement = useDerivedValue(() => {
    const { x, elevation } = bodyPosition(scene.progress * entry.value);
    return {
      x: x * width,
      y: SCENE_HORIZON_Y - elevation * SCENE_BODY_TRAVEL,
      elevation,
    };
  });
  const transform = useDerivedValue(() => [
    { translateX: placement.value.x },
    { translateY: placement.value.y },
  ]);

  return (
    <Group transform={transform}>
      {scene.body === 'sun' ? (
        <Sun placement={placement} time={time} />
      ) : (
        <Moon time={time} night={scene.phase === 'night'} />
      )}
      <BurstRays burst={burst} />
    </Group>
  );
}

function Sun({
  placement,
  time,
}: {
  placement: DerivedValue<Placement>;
  time: SharedValue<number>;
}) {
  const theme = useTheme();
  const palette = useScenePalette();
  const color = useDerivedValue(() =>
    interpolateColor(
      Math.min(1, placement.value.elevation / LOW_SUN_ELEVATION),
      [0, 1],
      [palette.sunLow, theme.sun],
    ),
  );
  const glowRadius = useDerivedValue(
    () =>
      SUN_GLOW_RADIUS +
      SUN_GLOW_PULSE * Math.sin(TWO_PI * time.value * GLOW_CYCLES),
  );
  const rotation = useDerivedValue(() => [{ rotate: TWO_PI * time.value }]);

  return (
    <>
      <Circle r={glowRadius} color={color} opacity={SUN_GLOW_OPACITY}>
        <BlurMask blur={SUN_GLOW_BLUR} style="normal" />
      </Circle>
      <Group transform={rotation}>
        <Path
          path={SUN_RAYS}
          style="stroke"
          strokeWidth={SUN_RAY_WIDTH}
          strokeCap="round"
          color={color}
        />
      </Group>
      <Circle r={SUN_RADIUS} color={color} />
    </>
  );
}

function Moon({ time, night }: { time: SharedValue<number>; night: boolean }) {
  const palette = useScenePalette();
  const color = night ? palette.nightMoon : palette.moon;
  const glowOpacity = useDerivedValue(
    () =>
      MOON_GLOW_BASE +
      MOON_GLOW_PULSE * Math.sin(TWO_PI * time.value * GLOW_CYCLES),
  );

  return (
    <>
      <Circle r={MOON_GLOW_RADIUS} color={color} opacity={glowOpacity}>
        <BlurMask blur={MOON_GLOW_BLUR} style="normal" />
      </Circle>
      <Group transform={[{ scale: MOON_SCALE }]}>
        <Path path={MOON_PATH} color={color} />
      </Group>
    </>
  );
}

function BurstRays({ burst }: { burst: SharedValue<number> }) {
  const theme = useTheme();
  const scale = useDerivedValue(
    () => BURST_START_RADIUS + BURST_TRAVEL * burst.value,
  );
  const transform = useDerivedValue(() => [{ scale: scale.value }]);
  const opacity = useDerivedValue(() =>
    burst.value > 0 && burst.value < 1 ? 1 - burst.value : 0,
  );
  const strokeWidth = useDerivedValue(() => BURST_STROKE / scale.value);

  return (
    <Group transform={transform} opacity={opacity}>
      <Path
        path={BURST_RAYS}
        style="stroke"
        strokeWidth={strokeWidth}
        strokeCap="round"
        color={theme.taken}
      />
    </Group>
  );
}
