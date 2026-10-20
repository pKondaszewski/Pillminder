import { Group, LinearGradient, Rect } from '@shopify/react-native-skia';
import { type SharedValue, useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import { SCENE_HEIGHT, withAlpha } from '@/scene/scene-service';

const WAVE_BAND = 0.6;
const WAVE_PEAK_ALPHA = 0.4;

type Props = {
  width: number;
  topInset: number;
  burst: SharedValue<number>;
};

export function SceneCelebrationWave({ width, topInset, burst }: Props) {
  const theme = useTheme();
  const bandWidth = width * WAVE_BAND;
  const transform = useDerivedValue(() => [
    { translateX: -bandWidth + (width + bandWidth) * burst.value },
  ]);
  const opacity = useDerivedValue(() =>
    burst.value > 0 && burst.value < 1 ? 1 : 0,
  );

  return (
    <Group transform={transform} opacity={opacity}>
      <Rect
        x={0}
        y={-topInset}
        width={bandWidth}
        height={SCENE_HEIGHT + topInset}
      >
        <LinearGradient
          start={{ x: 0, y: 0 }}
          end={{ x: bandWidth, y: 0 }}
          colors={[
            withAlpha(theme.taken, 0),
            withAlpha(theme.taken, WAVE_PEAK_ALPHA),
            withAlpha(theme.taken, 0),
          ]}
        />
      </Rect>
    </Group>
  );
}
