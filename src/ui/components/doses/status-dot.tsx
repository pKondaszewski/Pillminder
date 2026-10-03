import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

import type { DoseState } from '@/doses/dose-transition';
import { useTheme } from '@/ui/hooks/use-theme';

const TAKEN_COLOR = '#34c759';

export function DoseStatusDot({ state }: { state: DoseState }) {
  const theme = useTheme();
  const pulse = useSharedValue(1);
  const pending = state === 'pending';
  const dotColors = {
    pending: theme.accent,
    taken: TAKEN_COLOR,
    skipped: theme.textSecondary,
  };

  useEffect(() => {
    if (!pending) {
      cancelAnimation(pulse);
      pulse.value = 1;
      return;
    }
    pulse.value = withRepeat(
      withTiming(0.25, { duration: 850, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
    return () => cancelAnimation(pulse);
  }, [pending, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: pending ? pulse.value : 1,
  }));

  return (
    <Animated.View
      style={[styles.dot, { backgroundColor: dotColors[state] }, animatedStyle]}
    />
  );
}

const styles = StyleSheet.create({
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
});
