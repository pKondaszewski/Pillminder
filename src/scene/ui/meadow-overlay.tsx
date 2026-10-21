import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';

import { FontFamily } from '@/commons/ui/constants/fonts';
import { Colors, MIN_TOUCH_SIZE } from '@/commons/ui/constants/theme';
import { useTheme } from '@/commons/ui/use-theme';
import {
  basketSlot,
  type MeadowMark,
  meadowSlot,
  SCENE_HEIGHT,
} from '@/scene/scene-service';

const COUNTER_WIDTH = 40;
const COUNTER_FONT_SIZE = 10;
const COUNTER_LIFT = 8;
const BADGE_SIZE = 18;
const BADGE_FONT_SIZE = 11;
const BADGE_OFFSET_X = 10;
const BADGE_OFFSET_Y = 36;
const TARGET_LIFT = 14;
const MAX_BADGE = 99;

type Props = {
  marks: MeadowMark[];
  topInset: number;
  selectedId: string | null;
  night: boolean;
  onSelect: (markId: string) => void;
  children?: ReactNode;
};

export function MeadowOverlay({
  marks,
  topInset,
  selectedId,
  night,
  onSelect,
  children,
}: Props) {
  const { width } = useWindowDimensions();
  const basket = basketSlot(width);
  const taken = marks.reduce((sum, mark) => sum + mark.taken, 0);
  const total = marks.reduce((sum, mark) => sum + mark.size, 0);

  return (
    <View
      pointerEvents="box-none"
      style={[styles.layer, { top: topInset, height: SCENE_HEIGHT }]}
    >
      {total > 0 ? (
        <Text
          style={[
            styles.counter,
            {
              color: '#FFFFFF',
              left: basket.x - COUNTER_WIDTH / 2,
              top: basket.y - COUNTER_LIFT,
            },
          ]}
        >
          {taken}/{total}
        </Text>
      ) : null}
      {marks.map((mark, index) => {
        const { x, y } = meadowSlot(mark.position, index, width);
        return (
          <MarkWidgets
            key={mark.id}
            mark={mark}
            x={x}
            y={y}
            selected={mark.id === selectedId}
            night={night}
            onSelect={onSelect}
          />
        );
      })}
      {children}
    </View>
  );
}

function MarkWidgets({
  mark,
  x,
  y,
  selected,
  night,
  onSelect,
}: {
  mark: MeadowMark;
  x: number;
  y: number;
  selected: boolean;
  night: boolean;
  onSelect: (markId: string) => void;
}) {
  const theme = useTheme();
  const badgeTheme = night ? Colors.dark : theme;

  return (
    <>
      {mark.size > 1 ? (
        <View
          pointerEvents="none"
          style={[
            styles.badge,
            {
              backgroundColor: badgeTheme.text,
              left: x + BADGE_OFFSET_X - BADGE_SIZE / 2,
              top: y - BADGE_OFFSET_Y - BADGE_SIZE / 2,
            },
          ]}
        >
          <Text style={[styles.badgeText, { color: badgeTheme.background }]}>
            {mark.size > MAX_BADGE ? `${MAX_BADGE}+` : mark.size}
          </Text>
        </View>
      ) : null}
      {mark.status === 'taken' ? null : (
        <Pressable
          onPress={() => onSelect(mark.id)}
          accessibilityRole="button"
          accessibilityLabel={mark.label}
          style={[
            styles.target,
            {
              left: x - MIN_TOUCH_SIZE / 2,
              top: y - TARGET_LIFT - MIN_TOUCH_SIZE / 2,
            },
            selected && { backgroundColor: theme.cardGlass },
          ]}
        />
      )}
    </>
  );
}

const styles = StyleSheet.create({
  layer: {
    position: 'absolute',
    left: 0,
    right: 0,
    zIndex: 1,
  },
  counter: {
    position: 'absolute',
    width: COUNTER_WIDTH,
    textAlign: 'center',
    fontFamily: FontFamily.bold,
    fontSize: COUNTER_FONT_SIZE,
  },
  badge: {
    position: 'absolute',
    minWidth: BADGE_SIZE,
    height: BADGE_SIZE,
    paddingHorizontal: 4,
    borderRadius: BADGE_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: FontFamily.bold,
    fontSize: BADGE_FONT_SIZE,
  },
  target: {
    position: 'absolute',
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderRadius: MIN_TOUCH_SIZE / 2,
  },
});
