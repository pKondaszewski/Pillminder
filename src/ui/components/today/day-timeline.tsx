import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path, Text as SvgText } from 'react-native-svg';

import {
  ARC_HEIGHT,
  ARC_HORIZON_Y,
  ARC_WIDTH,
  arcPath,
  arcPoint,
  axisTicks,
  type DaySymbol,
  skyPath,
  type SkyTone,
  type TimelineMark,
} from '@/doses/dose-service';
import { FontFamily } from '@/ui/commons/constants/fonts';
import type { ThemeColor } from '@/ui/commons/constants/theme';
import { DaySymbolMark } from '@/ui/components/today/day-symbol';
import { TimelineDot } from '@/ui/components/today/timeline-dot';
import { useTheme } from '@/ui/hooks/use-theme';

const SKY_COLORS: Record<SkyTone, ThemeColor> = {
  day: 'accentSoft',
  night: 'nightSoft',
  overdue: 'overdueSoft',
  done: 'takenSoft',
};
const TRACK_WIDTH = 1.5;
const PASSED_WIDTH = 2;
const TRACK_DASH = '3 5';
const TICK_FONT_SIZE = 11;
const TEXT_INSET_X = 49;
const TEXT_TOP_Y = 84;
const TEXT_GAP = 2;
const TEXT_INSET = `${(TEXT_INSET_X / ARC_WIDTH) * 100}%` as const;
const TEXT_TOP = `${(TEXT_TOP_Y / ARC_HEIGHT) * 100}%` as const;

type Props = {
  marks: TimelineMark[];
  nowPosition: number | null;
  symbol: DaySymbol | null;
  skyTone: SkyTone | null;
  children: ReactNode;
};

export function DayTimeline({
  marks,
  nowPosition,
  symbol,
  skyTone,
  children,
}: Props) {
  const theme = useTheme();
  const now = nowPosition === null ? null : arcPoint(nowPosition);

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        style={styles.arc}
        viewBox={`0 0 ${ARC_WIDTH} ${ARC_HEIGHT}`}
      >
        {nowPosition !== null && skyTone !== null ? (
          <Path d={skyPath(nowPosition)} fill={theme[SKY_COLORS[skyTone]]} />
        ) : null}
        <Path
          d={arcPath(0, 1)}
          fill="none"
          stroke={theme.borderStrong}
          strokeWidth={TRACK_WIDTH}
          strokeDasharray={TRACK_DASH}
          strokeLinecap="round"
        />
        {nowPosition !== null ? (
          <Path
            d={arcPath(0, nowPosition)}
            fill="none"
            stroke={theme.textTertiary}
            strokeWidth={PASSED_WIDTH}
            strokeLinecap="round"
          />
        ) : null}
        <Path
          d={`M0 ${ARC_HORIZON_Y}H${ARC_WIDTH}`}
          stroke={theme.borderStrong}
          strokeWidth={TRACK_WIDTH}
        />
        {axisTicks().map(({ label, x, y, anchor }) => (
          <SvgText
            key={label}
            x={x}
            y={y}
            textAnchor={anchor}
            fontFamily={FontFamily.mono}
            fontSize={TICK_FONT_SIZE}
            fill={theme.textTertiary}
          >
            {label}
          </SvgText>
        ))}
        {marks.map((mark) => (
          <TimelineDot
            key={mark.id}
            statuses={mark.statuses}
            count={mark.count}
            center={arcPoint(mark.position)}
          />
        ))}
        {now !== null && symbol !== null ? (
          <DaySymbolMark symbol={symbol} x={now.x} y={now.y} />
        ) : null}
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  arc: {
    aspectRatio: ARC_WIDTH / ARC_HEIGHT,
  },
  center: {
    position: 'absolute',
    left: TEXT_INSET,
    right: TEXT_INSET,
    top: TEXT_TOP,
    alignItems: 'center',
    gap: TEXT_GAP,
  },
});
