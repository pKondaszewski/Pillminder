import { Group, Path, Skia } from '@shopify/react-native-skia';
import { useEffect } from 'react';
import {
  Easing,
  type SharedValue,
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import {
  basketSlot,
  type MeadowEvent,
  type MeadowMark,
  meadowSlot,
  type Point,
  type Season,
} from '@/scene/scene-service';
import { ClumpOfPlants } from '@/scene/ui/scene-plant';
import { MEADOW_EVENT_MS } from '@/scene/ui/use-meadow-events';

const FLIGHT_ARC = 60;
const FLIGHT_BASKET_LIFT = 10;
const FLIGHT_START_SCALE = 1.1;
const FLIGHT_SHRINK = 0.5;
const SPARK_COUNT = 8;
const SPARK_RISE = 12;
const SPARK_START_DISTANCE = 8;
const SPARK_TRAVEL = 22;
const SPARK_ANGLE_OFFSET = 0.3;
const SPARK_MAX_RADIUS = 2.6;
const SPARK_MIN_RADIUS = 0.4;
const SPARK_MS = 800;

type Props = {
  event: MeadowEvent;
  mark: MeadowMark;
  index: number;
  season: Season;
  width: number;
  wave: SharedValue<number>;
};

export function MeadowEventEffect({
  event,
  mark,
  index,
  season,
  width,
  wave,
}: Props) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: MEADOW_EVENT_MS,
      easing: Easing.linear,
    });
  }, [progress]);

  const slot = meadowSlot(mark.position, index, width);

  return (
    <>
      {event.flies ? (
        <Flight
          mark={mark}
          season={season}
          width={width}
          from={slot}
          progress={progress}
          wave={wave}
        />
      ) : null}
      <Sparks center={slot} progress={progress} />
    </>
  );
}

function Flight({
  mark,
  season,
  width,
  from,
  progress,
  wave,
}: {
  mark: MeadowMark;
  season: Season;
  width: number;
  from: Point;
  progress: SharedValue<number>;
  wave: SharedValue<number>;
}) {
  const basket = basketSlot(width);
  const transform = useDerivedValue(() => {
    const eased = 1 - Math.pow(1 - progress.value, 3);
    return [
      { translateX: from.x + (basket.x - from.x) * eased },
      {
        translateY:
          from.y +
          (basket.y - FLIGHT_BASKET_LIFT - from.y) * eased -
          Math.sin(Math.PI * eased) * FLIGHT_ARC,
      },
      { scale: FLIGHT_START_SCALE - FLIGHT_SHRINK * eased },
    ];
  });

  return (
    <Group transform={transform}>
      <ClumpOfPlants
        size={mark.size}
        season={season}
        status="overdue"
        wave={wave}
      />
    </Group>
  );
}

function Sparks({
  center,
  progress,
}: {
  center: Point;
  progress: SharedValue<number>;
}) {
  const theme = useTheme();
  const sparkProgress = useDerivedValue(() =>
    Math.min(1, (progress.value * MEADOW_EVENT_MS) / SPARK_MS),
  );
  const green = useDerivedValue(() =>
    sparkPath(center, sparkProgress.value, 0),
  );
  const gold = useDerivedValue(() => sparkPath(center, sparkProgress.value, 1));
  const opacity = useDerivedValue(() => 1 - sparkProgress.value);

  return (
    <Group opacity={opacity}>
      <Path path={green} color={theme.taken} />
      <Path path={gold} color={theme.sun} />
    </Group>
  );
}

function sparkPath(center: Point, progress: number, parity: number) {
  'worklet';
  const path = Skia.Path.Make();
  const eased = 1 - Math.pow(1 - progress, 3);
  const radius = SPARK_MAX_RADIUS * (1 - progress) + SPARK_MIN_RADIUS;
  const distance = SPARK_START_DISTANCE + SPARK_TRAVEL * eased;
  for (let i = parity; i < SPARK_COUNT; i += 2) {
    const angle = (2 * Math.PI * i) / SPARK_COUNT + SPARK_ANGLE_OFFSET;
    path.addCircle(
      center.x + Math.cos(angle) * distance,
      center.y - SPARK_RISE + Math.sin(angle) * distance,
      radius,
    );
  }
  return path;
}
