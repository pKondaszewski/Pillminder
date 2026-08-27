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

const PENDING_COLOR = '#3c87f7';
const TAKEN_COLOR = '#34c759';

export function DoseStatusDot({ taken }: { taken: boolean }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    if (taken) {
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
  }, [taken, pulse]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: taken ? 1 : pulse.value,
  }));

  return (
    <Animated.View
      style={[
        styles.dot,
        { backgroundColor: taken ? TAKEN_COLOR : PENDING_COLOR },
        animatedStyle,
      ]}
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
