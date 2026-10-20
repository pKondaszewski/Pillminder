import { Circle, Group, Rect, RoundedRect } from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { type RoadAxis, roadX, roadY } from '@/scene/scene-service';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const CAR_LIFT = 4;
const DRIVING_BOUNCE = 1.5;
const IDLE_BOUNCE = 0.4;
const BOUNCE_CYCLES = 48;
const TWO_PI = 2 * Math.PI;

type Props = {
  width: number;
  axis: RoadAxis;
  tripDays: number;
  time: SharedValue<number>;
  entry: SharedValue<number>;
};

export function SceneCar({ width, axis, tripDays, time, entry }: Props) {
  const palette = useScenePalette();
  const departureX = roadX(axis, 0);
  const destinationX = roadX(axis, tripDays);
  const transform = useDerivedValue(() => {
    const x = departureX + (destinationX - departureX) * entry.value;
    const bounce =
      Math.abs(Math.sin(TWO_PI * time.value * BOUNCE_CYCLES)) *
      (entry.value < 1 ? DRIVING_BOUNCE : IDLE_BOUNCE);
    return [
      { translateX: x },
      { translateY: roadY(width, x) - CAR_LIFT - bounce },
    ];
  });

  return (
    <Group transform={transform}>
      <RoundedRect
        x={-13}
        y={-9}
        width={26}
        height={9}
        r={3}
        color={palette.car}
      />
      <RoundedRect
        x={-7}
        y={-15}
        width={14}
        height={7}
        r={3}
        color={palette.car}
      />
      <Rect x={-5} y={-13.5} width={4.5} height={4} color={palette.window} />
      <Rect x={1} y={-13.5} width={4.5} height={4} color={palette.window} />
      <Circle cx={-7} cy={1} r={3} color={palette.wheel} />
      <Circle cx={7} cy={1} r={3} color={palette.wheel} />
      <Rect x={-6} y={-19} width={10} height={4} color={palette.suitcase} />
    </Group>
  );
}
