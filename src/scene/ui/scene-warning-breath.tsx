import { Rect } from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import { SCENE_HEIGHT } from '@/scene/scene-service';

const BREATH_BASE = 0.14;
const BREATH_DEPTH = 0.1;
const BREATH_CYCLES = 12;
const TWO_PI = 2 * Math.PI;

type Props = {
  width: number;
  topInset: number;
  time: SharedValue<number>;
};

export function SceneWarningBreath({ width, topInset, time }: Props) {
  const theme = useTheme();
  const opacity = useDerivedValue(
    () =>
      BREATH_BASE +
      BREATH_DEPTH * Math.sin(TWO_PI * time.value * BREATH_CYCLES),
  );

  return (
    <Rect
      x={0}
      y={-topInset}
      width={width}
      height={SCENE_HEIGHT + topInset}
      color={theme.overdue}
      opacity={opacity}
    />
  );
}
