import { Group, LinearGradient, Path, vec } from '@shopify/react-native-skia';
import { useDerivedValue } from 'react-native-reanimated';

import { useTheme } from '@/commons/ui/use-theme';
import { ellipsePath, mixColors } from '@/scene/scene-service';
import { type PlantProps, usePlantTone } from '@/scene/ui/plant-parts';
import { useScenePalette } from '@/scene/ui/use-scene-palette';

const PORCINI_STEM = 'M-3.6 0Q-5 -4 -2.6 -8L2.6 -8Q5 -4 3.6 0Z';
const BOLETE_STEM = 'M-2.4 0L-2 -12L2 -12L2.4 0Z';
const BOLETE_SCALES = [
  [-1, -3],
  [1, -5],
  [-0.6, -7],
  [1.1, -9],
  [-1, -10.5],
  [0.6, -1.5],
]
  .map(([x, y]) => ellipsePath(x, y, 0.55, 0.3))
  .join('');
const SCALE_COLOR = '#3B3330';
const PORCINI_CAP = { y: -8, radius: 7 };
const BOLETE_CAP = { y: -12, radius: 8.5 };
const CAP_DEPTH = 0.72;
const CAP_LIGHTEN = 0.12;
const CAP_DARKEN = 0.15;
const GILLS_HEIGHT = 1.4;
const GILLS_INSET = 0.5;
const PORCINI_GILLS = '#E8DDC6';
const BOLETE_GILLS_LIGHTEN = 0.55;
const SWAY = 0.1;

export function Mushroom({ status, wave }: PlantProps) {
  const theme = useTheme();
  const palette = useScenePalette();
  const tone = usePlantTone(status);
  const due = status === 'overdue';
  const cap = due ? BOLETE_CAP : PORCINI_CAP;
  const capColor = due ? theme.overdue : tone(palette.mushroomCap);
  const sway = useDerivedValue(() => [{ rotate: due ? SWAY * wave.value : 0 }]);

  return (
    <Group transform={sway}>
      <Path
        path={due ? BOLETE_STEM : PORCINI_STEM}
        color={tone(palette.mushroomStem)}
      />
      {due ? <Path path={BOLETE_SCALES} color={SCALE_COLOR} /> : null}
      <Path
        path={`M${-cap.radius} ${cap.y}A${cap.radius} ${cap.radius * CAP_DEPTH} 0 0 1 ${cap.radius} ${cap.y}Z`}
      >
        <LinearGradient
          start={vec(0, cap.y - cap.radius)}
          end={vec(0, cap.y)}
          colors={[
            mixColors(capColor, '#FFFFFF', CAP_LIGHTEN),
            mixColors(capColor, '#000000', CAP_DARKEN),
          ]}
        />
      </Path>
      <Path
        path={`M${-(cap.radius - GILLS_INSET)} ${cap.y}A${cap.radius - GILLS_INSET} ${GILLS_HEIGHT} 0 0 0 ${cap.radius - GILLS_INSET} ${cap.y}Z`}
        color={
          due
            ? mixColors(theme.overdue, '#FFFFFF', BOLETE_GILLS_LIGHTEN)
            : tone(PORCINI_GILLS)
        }
      />
    </Group>
  );
}
