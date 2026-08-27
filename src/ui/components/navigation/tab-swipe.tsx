import { router, useFocusEffect, usePathname } from 'expo-router';
import { useCallback, useState, type ReactNode } from 'react';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, { Keyframe } from 'react-native-reanimated';
import { StyleSheet } from 'react-native';

const TAB_ORDER = ['/', '/products', '/schedules'] as const;

let prevIndex = 0;

export function TabSwipe({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const index = (TAB_ORDER as readonly string[]).indexOf(pathname);

  const [anim, setAnim] = useState({ tick: 0, direction: 1 });

  useFocusEffect(
    useCallback(() => {
      const direction = index >= prevIndex ? 1 : -1;
      prevIndex = index < 0 ? prevIndex : index;
      setAnim((prev) => ({ tick: prev.tick + 1, direction }));
    }, [index]),
  );

  const goTo = (target: number) => {
    if (index < 0 || target < 0 || target >= TAB_ORDER.length) return;
    router.navigate(TAB_ORDER[target]);
  };

  const swipe = Gesture.Race(
    Gesture.Fling()
      .direction(Directions.LEFT)
      .runOnJS(true)
      .onEnd(() => goTo(index + 1)),
    Gesture.Fling()
      .direction(Directions.RIGHT)
      .runOnJS(true)
      .onEnd(() => goTo(index - 1)),
  );

  const entering = new Keyframe({
    0: { opacity: 0, transform: [{ translateX: 24 * anim.direction }] },
    100: { opacity: 1, transform: [{ translateX: 0 }] },
  }).duration(220);

  return (
    <GestureDetector gesture={swipe}>
      <Animated.View key={anim.tick} entering={entering} style={styles.fill}>
        {children}
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
