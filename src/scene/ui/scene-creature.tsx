import { Group, Path } from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import {
  CREATURE_SHADOW_OFFSET_Y,
  CREATURE_SHADOW_RADIUS_X,
  CREATURE_SHADOW_RADIUS_Y,
  creatureSlot,
  ellipsePath,
  type Season,
  spikePath,
} from '@/scene/scene-service';

const TWO_PI = 2 * Math.PI;
const WALK_CYCLES = 96;
const IDLE_CYCLES = 24;
const WING_CYCLES = 240;
const SLEEP_CYCLES = 8;
const SHADOW = ellipsePath(
  0,
  CREATURE_SHADOW_OFFSET_Y,
  CREATURE_SHADOW_RADIUS_X,
  CREATURE_SHADOW_RADIUS_Y,
);
const SHADOW_COLOR = 'rgba(0,0,0,0.12)';
const DARK = '#1F1F24';
const BEE_DARK = '#2A2420';
const SLEEP_MARK = 'M-2.5 -3H2.5L-2.5 3H2.5';
const SLEEP_MARK_WIDTH = 1.2;
const SLEEP_RISE_X = 4;
const SLEEP_RISE_Y = 10;
const WING = ellipsePath(0, 0, 3.5, 2.2);

const LADYBIRD_BODY = 'M-6.5 -1A6.5 5 0 0 1 6.5 -1L6.5 2L-6.5 2Z';
const LADYBIRD_SPOTS = [
  [-3, -3],
  [-1.5, 0],
  [4, -3],
  [4.5, 0],
]
  .map(([x, y]) => ellipsePath(x, y, 1, 1))
  .join('');
const LADYBIRD_RED = '#D93A2E';
const BEE_YELLOW = '#F2B632';
const BEE_BODY = ellipsePath(0, -1, 6, 4);
const BEE_HEAD = ellipsePath(6, -1.4, 2.4, 2.4);
const BEE_STRIPES = 'M-2.6 -4.6H-1V2.6H-2.6ZM0.6 -4.8H2.2V2.8H0.6Z';
const WING_COLOR = 'rgba(255,255,255,0.75)';
const HEDGEHOG_SPIKES = spikePath();
const HEDGEHOG_BROWN = '#6B4A2B';
const HEDGEHOG_FACE = '#C9A27A';
const FINCH_BODY = ellipsePath(-1, -4, 6.5, 5.5);
const FINCH_BREAST = ellipsePath(1, -2, 4.6, 4.2);
const FINCH_CAP = 'M-1.234 -6.949A3.4 3.4 0 1 1 5.234 -6.951Z';
const FINCH_TAIL = 'M-6 -5L-11 -3L-6 -2Z';
const FINCH_BEAK = 'M5 -6.5L7.5 -6L5 -5Z';
const FINCH_LEGS = 'M-1 1V3M1 1V3';
const FINCH_GREY = '#5E6670';
const FINCH_RED = '#E2675F';
const EYE_WIDTH = 0.6;

type Props = {
  season: Season;
  asleep: boolean;
  position: number;
  width: number;
  entry: SharedValue<number>;
  time: SharedValue<number>;
};

export function SceneCreature({
  season,
  asleep,
  position,
  width,
  entry,
  time,
}: Props) {
  const placement = useDerivedValue(() => {
    const { x, y } = creatureSlot(position, width, entry.value);
    return [{ translateX: x }, { translateY: y }];
  });
  const bob = useDerivedValue(() => {
    const cycles = entry.value < 1 ? WALK_CYCLES : IDLE_CYCLES;
    const step = Math.sin(TWO_PI * time.value * cycles);
    return [{ translateY: bobOffset(season, asleep, step) }];
  });

  return (
    <Group transform={placement}>
      <Path path={SHADOW} color={SHADOW_COLOR} />
      <Group transform={bob}>
        {season === 'spring' ? <Ladybird /> : null}
        {season === 'summer' ? <Bee asleep={asleep} time={time} /> : null}
        {season === 'autumn' ? <Hedgehog asleep={asleep} /> : null}
        {season === 'winter' ? <Bullfinch asleep={asleep} /> : null}
      </Group>
      {asleep ? <SleepMark time={time} /> : null}
    </Group>
  );
}

function bobOffset(season: Season, asleep: boolean, step: number): number {
  'worklet';
  if (season === 'summer') return asleep ? 2 : -6 + step * 2;
  if (asleep) return 0;
  if (season === 'spring') return -Math.abs(step) * 0.8;
  if (season === 'autumn') return -Math.abs(step) * 0.6;
  return -Math.max(0, step) * 3;
}

function Ladybird() {
  return (
    <>
      <Path path={ellipsePath(6, -1, 2.6, 2.6)} color={DARK} />
      <Path path={LADYBIRD_BODY} color={LADYBIRD_RED} />
      <Path path="M1.5 -6V2" color={DARK} style="stroke" strokeWidth={0.8} />
      <Path path={LADYBIRD_SPOTS} color={DARK} />
    </>
  );
}

function Bee({ asleep, time }: { asleep: boolean; time: SharedValue<number> }) {
  const flap = useDerivedValue(
    () =>
      0.3 + 0.5 * Math.abs(Math.sin(TWO_PI * time.value * WING_CYCLES)) + 0.4,
  );
  const front = useDerivedValue(() => [
    { translateX: -1 },
    { translateY: -5 },
    { rotate: -0.4 },
    { scaleY: flap.value },
  ]);
  const back = useDerivedValue(() => [
    { translateX: 2 },
    { translateY: -5 },
    { rotate: 0.3 },
    { scaleY: flap.value * 0.9 },
  ]);

  return (
    <>
      {asleep ? null : (
        <>
          <Group transform={front}>
            <Path path={WING} color={WING_COLOR} />
          </Group>
          <Group transform={back}>
            <Path path={WING} color={WING_COLOR} />
          </Group>
        </>
      )}
      <Path path={BEE_BODY} color={BEE_YELLOW} />
      <Path path={BEE_STRIPES} color={BEE_DARK} />
      <Path path={BEE_HEAD} color={BEE_DARK} />
    </>
  );
}

function Hedgehog({ asleep }: { asleep: boolean }) {
  return (
    <>
      <Path path={HEDGEHOG_SPIKES} color={HEDGEHOG_BROWN} />
      <Group transform={[{ translateX: 7 }, { rotate: 0.2 }]}>
        <Path path={ellipsePath(0, 0, 4, 3)} color={HEDGEHOG_FACE} />
      </Group>
      <Path path={ellipsePath(10.8, 0.4, 1, 1)} color={DARK} />
      <Eye asleep={asleep} x={7.6} y={-1} radius={0.7} color={DARK} />
    </>
  );
}

function Bullfinch({ asleep }: { asleep: boolean }) {
  return (
    <>
      <Path path={FINCH_BODY} color={FINCH_GREY} />
      <Path path={FINCH_BREAST} color={FINCH_RED} />
      <Path path={FINCH_CAP} color={DARK} />
      <Path path={FINCH_TAIL} color={DARK} />
      <Path path={FINCH_BEAK} color={BEE_DARK} />
      <Eye asleep={asleep} x={3.6} y={-7} radius={0.6} color="#FFFFFF" />
      <Path
        path={FINCH_LEGS}
        color={BEE_DARK}
        style="stroke"
        strokeWidth={0.8}
      />
    </>
  );
}

function Eye({
  asleep,
  x,
  y,
  radius,
  color,
}: {
  asleep: boolean;
  x: number;
  y: number;
  radius: number;
  color: string;
}) {
  return asleep ? (
    <Path
      path={`M${x - radius} ${y}Q${x} ${y + radius} ${x + radius} ${y}`}
      color={DARK}
      style="stroke"
      strokeWidth={EYE_WIDTH}
    />
  ) : (
    <Path path={ellipsePath(x, y, radius, radius)} color={color} />
  );
}

function SleepMark({ time }: { time: SharedValue<number> }) {
  const theme = useTheme();
  const progress = useDerivedValue(() => (time.value * SLEEP_CYCLES) % 1);
  const transform = useDerivedValue(() => [
    { translateX: 8 + progress.value * SLEEP_RISE_X },
    { translateY: -12 - progress.value * SLEEP_RISE_Y },
  ]);
  const opacity = useDerivedValue(() => Math.sin(Math.PI * progress.value));

  return (
    <Group transform={transform} opacity={opacity}>
      <Path
        path={SLEEP_MARK}
        color={theme.text}
        style="stroke"
        strokeWidth={SLEEP_MARK_WIDTH}
        strokeCap="round"
        strokeJoin="round"
      />
    </Group>
  );
}
