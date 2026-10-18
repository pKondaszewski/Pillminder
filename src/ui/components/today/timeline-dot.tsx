import { Circle, G, Path, Text as SvgText } from 'react-native-svg';

import {
  type ArcPoint,
  type DoseStatus,
  pieSlicePath,
} from '@/doses/dose-service';
import { FontFamily } from '@/ui/commons/constants/fonts';
import { useTheme } from '@/ui/hooks/use-theme';

const SINGLE_RADIUS = 7;
const PIE_RADIUS = 10;
const COUNT_RADIUS = 12;
const RING_WIDTH = 2;
const SLICE_GAP_WIDTH = 1;
const COUNT_FONT_SIZE = 12;
const COUNT_BASELINE_OFFSET = 4;

type Props = {
  statuses: DoseStatus[];
  count: number | null;
  center: ArcPoint;
};

export function TimelineDot({ statuses, count, center }: Props) {
  const theme = useTheme();
  const isPlanned = statuses.every((status) => status === 'planned');
  const radius = dotRadius(statuses, count);

  if (count !== null) {
    return (
      <G>
        <Circle
          cx={center.x}
          cy={center.y}
          r={radius}
          fill={theme[statuses[0]]}
        />
        <SvgText
          x={center.x}
          y={center.y + COUNT_BASELINE_OFFSET}
          textAnchor="middle"
          fontFamily={FontFamily.mono}
          fontSize={COUNT_FONT_SIZE}
          fill={isPlanned ? theme.text : theme.onAccent}
        >
          {count}
        </SvgText>
      </G>
    );
  }

  return (
    <G>
      <Circle
        cx={center.x}
        cy={center.y}
        r={radius}
        fill={theme.background}
        stroke={isPlanned ? theme.planned : theme.background}
        strokeWidth={RING_WIDTH}
      />
      {isPlanned
        ? null
        : statuses.map((status, index) => (
            <Path
              key={index}
              d={pieSlicePath(center, radius, index, statuses.length)}
              fill={theme[status]}
              stroke={theme.background}
              strokeWidth={SLICE_GAP_WIDTH}
            />
          ))}
    </G>
  );
}

function dotRadius(statuses: DoseStatus[], count: number | null): number {
  if (count !== null) return COUNT_RADIUS;
  return statuses.length > 1 ? PIE_RADIUS : SINGLE_RADIUS;
}
