import { Circle, Group, Path } from '@shopify/react-native-skia';

import { useTheme } from '@/commons/ui/use-theme';
import { basketSlot } from '@/scene/scene-service';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const HANDLE = 'M-9 -6A9 9 0 0 1 9 -6';
const HANDLE_WIDTH = 2;
const BODY = 'M-12 -6L12 -6L9 8L-9 8Z';
const BERRY_RADIUS = 3;
const BERRY_SPACING = 3.5;
const BERRY_START_X = -7;
const BERRY_START_Y = -7;
const BERRY_LIFT = 2;
const MAX_BERRIES = 5;
const BERRY_PINK = '#F4B6C8';

type Props = {
  width: number;
  collected: number;
};

export function SceneBasket({ width, collected }: Props) {
  const theme = useTheme();
  const palette = useScenePalette();
  const { x, y } = basketSlot(width);
  const berryColors = [
    theme.taken,
    theme.sun,
    theme.overdue,
    BERRY_PINK,
    theme.taken,
  ];

  return (
    <Group transform={[{ translateX: x }, { translateY: y }]}>
      <Path
        path={HANDLE}
        color={palette.basket}
        style="stroke"
        strokeWidth={HANDLE_WIDTH}
      />
      <Path path={BODY} color={palette.basket} />
      {berryColors
        .slice(0, Math.min(collected, MAX_BERRIES))
        .map((color, i) => (
          <Circle
            key={i}
            cx={BERRY_START_X + i * BERRY_SPACING}
            cy={BERRY_START_Y - (i % 2) * BERRY_LIFT}
            r={BERRY_RADIUS}
            color={color}
          />
        ))}
    </Group>
  );
}
