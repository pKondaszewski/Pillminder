import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  type SharedValue,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { FontFamily } from '@/commons/ui/constants/fonts';
import { useTheme } from '@/commons/ui/use-theme';
import { type TripRibbon, type TripRibbons } from '@/products/trip-ribbons';
import {
  ROAD_PANEL_MARGIN,
  ROAD_PANEL_PADDING,
  ROAD_PANEL_TOP,
  type RoadAxis,
  roadX,
  withAlpha,
} from '@/scene/scene-service';

const RIBBON_ROW_HEIGHT = 26;
const PANEL_PADDING_TOP = 8;
const PANEL_PADDING_BOTTOM = 6;
const MORE_HEIGHT = 16;
const MARKER_TEXT_COLOR = '#FFFFFF';
const NAME_MAX_SHARE = 0.55;
const NAME_HEIGHT = 12;
const BAR_AREA_HEIGHT = RIBBON_ROW_HEIGHT - NAME_HEIGHT;
const RIBBON_THICKNESS = 6;
const OUTLINE_THICKNESS = 9;
const MARKER_SIZE = 17;
const MARKER_RING = 1.5;
const MARKER_NUDGE_X = 2; // the "!" sits just past the rounded end of the ribbon
const PULSE_CYCLES = 24;
const PULSE_AMPLITUDE = 0.15;
const GROW_DELAY = 0.25;
const GROW_STAGGER = 0.08;
const GROW_SPAN = 0.6;
const TRACK_ALPHA = 0.1;
const RETURN_LINE_ALPHA = 0.3;
const TWO_PI = 2 * Math.PI;

type Props = {
  ribbons: TripRibbons;
  axis: RoadAxis;
  time: SharedValue<number>;
  entry: SharedValue<number>;
};

export function ribbonPanelHeight({
  ribbons,
  hiddenCount,
}: TripRibbons): number {
  if (ribbons.length === 0) return 0;
  return (
    PANEL_PADDING_TOP +
    ribbons.length * RIBBON_ROW_HEIGHT +
    (hiddenCount > 0 ? MORE_HEIGHT : 0) +
    PANEL_PADDING_BOTTOM
  );
}

export function TripRibbonsPanel({
  ribbons: { ribbons, hiddenCount, hiddenAreAllEnough },
  axis,
  time,
  entry,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const tripWidth = axis.end - axis.start;
  const rowsHeight = ribbons.length * RIBBON_ROW_HEIGHT;

  return (
    <View
      style={[
        styles.panel,
        { backgroundColor: theme.cardGlass, borderColor: theme.border },
      ]}
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      pointerEvents="none"
    >
      <View style={styles.rows}>
        {ribbons.map((ribbon, index) => (
          <RibbonRow
            key={ribbon.id}
            ribbon={ribbon}
            index={index}
            axis={axis}
            tripWidth={tripWidth}
            time={time}
            entry={entry}
          />
        ))}
        <View
          style={[
            styles.returnLine,
            {
              left: tripWidth,
              height: rowsHeight,
              backgroundColor: withAlpha(theme.text, RETURN_LINE_ALPHA),
            },
          ]}
        />
      </View>
      {hiddenCount > 0 ? (
        <Text style={[styles.more, { color: theme.textSecondary }]}>
          {t(hiddenAreAllEnough ? 'travel.moreEnough' : 'travel.moreRibbons', {
            count: hiddenCount,
          })}
        </Text>
      ) : null}
    </View>
  );
}

type RowProps = {
  ribbon: TripRibbon;
  index: number;
  axis: RoadAxis;
  tripWidth: number;
  time: SharedValue<number>;
  entry: SharedValue<number>;
};

function RibbonRow({ ribbon, index, axis, tripWidth, time, entry }: RowProps) {
  const theme = useTheme();
  const tone = ribbon.warning ? theme.overdue : theme.taken;
  const ribbonWidth =
    Math.min(roadX(axis, ribbon.endDay), axis.limit) - axis.start;
  const grow = (entryValue: number) => {
    'worklet';
    const progress =
      (entryValue - GROW_DELAY - index * GROW_STAGGER) / GROW_SPAN;
    return Math.max(0, Math.min(1, progress));
  };
  const outlineStyle = useAnimatedStyle(() => ({
    width: ribbonWidth * grow(entry.value) + OUTLINE_THICKNESS,
  }));
  const fillStyle = useAnimatedStyle(() => ({
    width: ribbonWidth * grow(entry.value) + RIBBON_THICKNESS,
  }));
  const markerStyle = useAnimatedStyle(() => ({
    opacity: grow(entry.value) >= 1 ? 1 : 0,
    transform: [
      {
        scale:
          1 + PULSE_AMPLITUDE * Math.sin(TWO_PI * time.value * PULSE_CYCLES),
      },
    ],
  }));

  return (
    <View style={styles.row}>
      <Text
        numberOfLines={1}
        ellipsizeMode="tail"
        style={[
          styles.name,
          { color: theme.textSecondary, maxWidth: tripWidth * NAME_MAX_SHARE },
        ]}
      >
        {ribbon.name}
      </Text>
      <View style={styles.barArea}>
        <Bar
          thickness={RIBBON_THICKNESS}
          width={tripWidth + RIBBON_THICKNESS}
          color={withAlpha(theme.text, TRACK_ALPHA)}
        />
        <Bar
          thickness={OUTLINE_THICKNESS}
          style={outlineStyle}
          color={theme.background}
        />
        <Bar thickness={RIBBON_THICKNESS} style={fillStyle} color={tone} />
        {ribbon.runsOutDay === null ? null : (
          <Animated.View
            style={[
              styles.marker,
              {
                left:
                  roadX(axis, ribbon.runsOutDay) -
                  axis.start +
                  MARKER_NUDGE_X -
                  MARKER_SIZE / 2,
                backgroundColor: theme.background,
              },
              markerStyle,
            ]}
          >
            <View
              style={[styles.markerCore, { backgroundColor: theme.overdue }]}
            >
              <Text style={styles.markerText}>!</Text>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function Bar({
  thickness,
  color,
  width,
  style,
}: {
  thickness: number;
  color: string;
  width?: number;
  style?: object;
}) {
  return (
    <Animated.View
      style={[
        styles.bar,
        {
          height: thickness,
          borderRadius: thickness / 2,
          left: -thickness / 2,
          top: (BAR_AREA_HEIGHT - thickness) / 2,
          backgroundColor: color,
          width,
        },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    top: ROAD_PANEL_TOP,
    left: ROAD_PANEL_MARGIN,
    right: ROAD_PANEL_MARGIN,
    paddingHorizontal: ROAD_PANEL_PADDING,
    paddingTop: PANEL_PADDING_TOP,
    paddingBottom: PANEL_PADDING_BOTTOM,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  rows: { position: 'relative' },
  row: { height: RIBBON_ROW_HEIGHT },
  name: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    lineHeight: NAME_HEIGHT,
  },
  barArea: { height: BAR_AREA_HEIGHT },
  bar: { position: 'absolute' },
  marker: {
    position: 'absolute',
    top: (BAR_AREA_HEIGHT - MARKER_SIZE) / 2,
    width: MARKER_SIZE,
    height: MARKER_SIZE,
    borderRadius: MARKER_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerCore: {
    width: MARKER_SIZE - 2 * MARKER_RING,
    height: MARKER_SIZE - 2 * MARKER_RING,
    borderRadius: MARKER_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerText: {
    color: MARKER_TEXT_COLOR,
    fontFamily: FontFamily.bold,
    fontSize: 10,
    lineHeight: 12,
    includeFontPadding: false,
  },
  returnLine: { position: 'absolute', top: 0, width: 1 },
  more: {
    fontFamily: FontFamily.semiBold,
    fontSize: 10,
    height: MORE_HEIGHT,
    lineHeight: MORE_HEIGHT,
  },
});
