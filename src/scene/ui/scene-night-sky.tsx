import { Circle, Group, Line, vec } from '@shopify/react-native-skia';
import { useEffect, useMemo } from 'react';
import {
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { shootingStarDelayMs, type Star, stars } from '@/scene/scene-service';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const TWO_PI = 2 * Math.PI;
const TWINKLE_FLOOR = 0.3;
const SHOOTING_STAR_MS = 800;
const SHOOTING_STAR_START_X = 0.55;
const SHOOTING_STAR_START_Y = 30;
const SHOOTING_STAR_TRAVEL_X = 0.4;
const SHOOTING_STAR_TRAVEL_Y = 90;
const SHOOTING_STAR_ORIGIN = vec(0, 0);
const SHOOTING_STAR_TAIL = vec(-46, -24);
const SHOOTING_STAR_HEAD_RADIUS = 2.2;
const SHOOTING_STAR_WIDTH = 2;

type Props = {
  width: number;
  time: SharedValue<number>;
  entry: SharedValue<number>;
  shootingStars: boolean;
};

export function SceneNightSky({ width, time, entry, shootingStars }: Props) {
  const all = useMemo(() => stars(), []);

  return (
    <>
      {all.map((star, index) => (
        <TwinkleStar
          key={index}
          star={star}
          width={width}
          time={time}
          entry={entry}
        />
      ))}
      {shootingStars ? <ShootingStar width={width} /> : null}
    </>
  );
}

function TwinkleStar({
  star,
  width,
  time,
  entry,
}: {
  star: Star;
  width: number;
  time: SharedValue<number>;
  entry: SharedValue<number>;
}) {
  const palette = useScenePalette();
  const opacity = useDerivedValue(() => {
    const wave =
      0.5 + 0.5 * Math.sin(TWO_PI * (time.value * star.cycles + star.offset));
    return entry.value * (TWINKLE_FLOOR + (1 - TWINKLE_FLOOR) * wave);
  });

  return (
    <Circle
      cx={star.x * width}
      cy={star.y}
      r={star.radius}
      color={palette.star}
      opacity={opacity}
    />
  );
}

function ShootingStar({ width }: { width: number }) {
  const palette = useScenePalette();
  const progress = useSharedValue(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    const launch = () => {
      progress.value = 0;
      progress.value = withTiming(1, {
        duration: SHOOTING_STAR_MS,
        easing: Easing.in(Easing.quad),
      });
      timer = setTimeout(launch, shootingStarDelayMs(Math.random()));
    };
    timer = setTimeout(launch, shootingStarDelayMs(Math.random()));
    return () => clearTimeout(timer);
  }, [progress]);

  const transform = useDerivedValue(() => [
    {
      translateX:
        width * SHOOTING_STAR_START_X +
        progress.value * width * SHOOTING_STAR_TRAVEL_X,
    },
    {
      translateY:
        SHOOTING_STAR_START_Y + progress.value * SHOOTING_STAR_TRAVEL_Y,
    },
  ]);
  const opacity = useDerivedValue(() => Math.sin(Math.PI * progress.value));

  return (
    <Group transform={transform} opacity={opacity}>
      <Line
        p1={SHOOTING_STAR_ORIGIN}
        p2={SHOOTING_STAR_TAIL}
        color={palette.star}
        style="stroke"
        strokeWidth={SHOOTING_STAR_WIDTH}
        strokeCap="round"
      />
      <Circle r={SHOOTING_STAR_HEAD_RADIUS} color={palette.star} />
    </Group>
  );
}
