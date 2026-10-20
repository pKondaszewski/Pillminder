import { Group, Path, Skia } from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import {
  ellipsePath,
  GROUND_Y,
  makeParticles,
  type Particle,
  type Season,
  type SkyPhase,
} from '@/scene/scene-service';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const TWO_PI = 2 * Math.PI;
const SNOW = makeParticles(7, 42);
const LEAVES = makeParticles(11, 9);
const PETALS = makeParticles(17, 7);
const FIREFLIES = makeParticles(23, 10);
const SNOW_OPACITY = 0.8;
const SNOW_SWAY = 7;
const SNOW_MIN_RADIUS = 1;
const SNOW_RADIUS_SPREAD = 1.8;
const SNOW_FALL = GROUND_Y + 40;
const LEAF_FALL = GROUND_Y + 30;
const LEAF_SWAY = 18;
const LEAF_OPACITY = 0.85;
const LEAF_COLORS = ['#D9822B', '#C4572E', '#E9B23B'];
const LEAF_SHAPE = ellipsePath(0, 0, 5, 2.5);
const PETAL_COLOR = '#F4B6C8';
const PETAL_OPACITY = 0.8;
const PETAL_SHAPE = ellipsePath(0, 0, 3.5, 2);
const PETAL_SPAN = 40;
const PETAL_TOP = 60;
const PETAL_BAND = 120;
const PETAL_BOB = 14;
const FIREFLY_COLOR = '#E8F27A';
const FIREFLY_TOP = 150;
const FIREFLY_BAND = 50;
const FIREFLY_DRIFT = 10;
const FIREFLY_BOB = 6;
const FIREFLY_CORE = 1.8;
const FIREFLY_HALO = 4.5;
const FIREFLY_HALO_OPACITY = 0.35;

type Props = {
  season: Season;
  phase: SkyPhase;
  width: number;
  time: SharedValue<number>;
};

export function SceneWeather({ season, phase, width, time }: Props) {
  if (season === 'winter') return <Snowfall width={width} time={time} />;
  if (season === 'autumn') return <Leaves width={width} time={time} />;
  if (season === 'summer' && phase === 'night') {
    return <Fireflies width={width} time={time} />;
  }
  if (season === 'spring' && phase !== 'night') {
    return <Petals width={width} time={time} />;
  }
  return null;
}

function Snowfall({
  width,
  time,
}: {
  width: number;
  time: SharedValue<number>;
}) {
  const palette = useScenePalette();
  const flakes = useDerivedValue(() => {
    const path = Skia.Path.Make();
    for (const flake of SNOW) {
      const y = ((flake.y + time.value * flake.cycles) % 1) * SNOW_FALL - 10;
      const x =
        flake.x * width +
        SNOW_SWAY *
          Math.sin(TWO_PI * (time.value * flake.cycles * 2 + flake.offset));
      path.addCircle(x, y, SNOW_MIN_RADIUS + SNOW_RADIUS_SPREAD * flake.size);
    }
    return path;
  });

  return <Path path={flakes} color={palette.snow} opacity={SNOW_OPACITY} />;
}

function Leaves({ width, time }: { width: number; time: SharedValue<number> }) {
  return (
    <>
      {LEAVES.map((leaf, index) => (
        <Leaf
          key={index}
          leaf={leaf}
          color={LEAF_COLORS[index % LEAF_COLORS.length]}
          width={width}
          time={time}
        />
      ))}
    </>
  );
}

function Leaf({
  leaf,
  color,
  width,
  time,
}: {
  leaf: Particle;
  color: string;
  width: number;
  time: SharedValue<number>;
}) {
  const transform = useDerivedValue(() => [
    {
      translateX:
        leaf.x * width +
        LEAF_SWAY *
          Math.sin(TWO_PI * (time.value * leaf.cycles * 1.5 + leaf.offset)),
    },
    {
      translateY: ((leaf.y + time.value * leaf.cycles) % 1) * LEAF_FALL - 10,
    },
    { rotate: TWO_PI * (time.value * leaf.cycles + leaf.offset) },
    { scale: 0.8 + 0.4 * leaf.size },
  ]);

  return (
    <Group transform={transform} opacity={LEAF_OPACITY}>
      <Path path={LEAF_SHAPE} color={color} />
    </Group>
  );
}

function Petals({ width, time }: { width: number; time: SharedValue<number> }) {
  return (
    <>
      {PETALS.map((petal, index) => (
        <Petal key={index} petal={petal} width={width} time={time} />
      ))}
    </>
  );
}

function Petal({
  petal,
  width,
  time,
}: {
  petal: Particle;
  width: number;
  time: SharedValue<number>;
}) {
  const transform = useDerivedValue(() => {
    const phase = TWO_PI * (time.value * petal.cycles * 2 + petal.offset);
    return [
      {
        translateX:
          ((petal.x + time.value * petal.cycles) % 1) * (width + PETAL_SPAN) -
          PETAL_SPAN / 2,
      },
      {
        translateY:
          PETAL_TOP + petal.y * PETAL_BAND + PETAL_BOB * Math.sin(phase),
      },
      { rotate: phase },
    ];
  });

  return (
    <Group transform={transform} opacity={PETAL_OPACITY}>
      <Path path={PETAL_SHAPE} color={PETAL_COLOR} />
    </Group>
  );
}

function Fireflies({
  width,
  time,
}: {
  width: number;
  time: SharedValue<number>;
}) {
  return (
    <>
      {FIREFLIES.map((firefly, index) => (
        <Firefly key={index} firefly={firefly} width={width} time={time} />
      ))}
    </>
  );
}

function Firefly({
  firefly,
  width,
  time,
}: {
  firefly: Particle;
  width: number;
  time: SharedValue<number>;
}) {
  const transform = useDerivedValue(() => [
    {
      translateX:
        firefly.x * width +
        FIREFLY_DRIFT *
          Math.sin(TWO_PI * (time.value * firefly.cycles + firefly.offset)),
    },
    {
      translateY:
        FIREFLY_TOP +
        firefly.y * FIREFLY_BAND +
        FIREFLY_BOB *
          Math.cos(TWO_PI * (time.value * firefly.cycles * 2 + firefly.offset)),
    },
  ]);
  const glow = useDerivedValue(
    () =>
      0.5 +
      0.5 *
        Math.sin(TWO_PI * (time.value * firefly.cycles * 4 + firefly.offset)),
  );
  const haloOpacity = useDerivedValue(() => glow.value * FIREFLY_HALO_OPACITY);

  return (
    <Group transform={transform}>
      <Path
        path={ellipsePath(0, 0, FIREFLY_HALO, FIREFLY_HALO)}
        color={FIREFLY_COLOR}
        opacity={haloOpacity}
      />
      <Path
        path={ellipsePath(0, 0, FIREFLY_CORE, FIREFLY_CORE)}
        color={FIREFLY_COLOR}
        opacity={glow}
      />
    </Group>
  );
}
