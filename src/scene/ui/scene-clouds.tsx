import { Circle, Group, RoundedRect } from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { useScenePalette } from '@/scene/ui/use-scene-palette';

const CLOUD_WIDTH = 64;
const CLOUDS = [
  { y: 74, offset: 0.1, scale: 1.1 },
  { y: 112, offset: 0.55, scale: 0.8 },
  { y: 40, offset: 0.8, scale: 0.65 },
] as const;

type Props = {
  width: number;
  time: SharedValue<number>;
  entry: SharedValue<number>;
};

export function SceneClouds({ width, time, entry }: Props) {
  return (
    <>
      {CLOUDS.map((cloud) => (
        <Cloud
          key={cloud.y}
          {...cloud}
          width={width}
          time={time}
          entry={entry}
        />
      ))}
    </>
  );
}

function Cloud({
  y,
  offset,
  scale,
  width,
  time,
  entry,
}: (typeof CLOUDS)[number] & Props) {
  const palette = useScenePalette();
  const travel = width + CLOUD_WIDTH * scale * 2;
  const transform = useDerivedValue(() => [
    {
      translateX: ((offset + time.value) % 1) * travel - CLOUD_WIDTH * scale,
    },
    { translateY: y },
    { scale },
  ]);
  const opacity = useDerivedValue(() => entry.value * palette.cloudOpacity);

  return (
    <Group transform={transform} opacity={opacity}>
      <Circle cx={16} cy={16} r={10} color={palette.cloud} />
      <Circle cx={30} cy={10} r={13} color={palette.cloud} />
      <Circle cx={46} cy={15} r={11} color={palette.cloud} />
      <RoundedRect
        x={6}
        y={16}
        width={52}
        height={10}
        r={5}
        color={palette.cloud}
      />
    </Group>
  );
}
