import { router, useFocusEffect, usePathname } from 'expo-router';
import { type ReactNode, useState } from 'react';
import { StyleSheet } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, { Keyframe } from 'react-native-reanimated';

import { neighbourTab, tabIndexOf } from './tab-order';

let prevIndex = 0;

export function TabSwipe({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const index = tabIndexOf(pathname);

  const [anim, setAnim] = useState({ tick: 0, direction: 1 });

  useFocusEffect(() => {
    const direction = index >= prevIndex ? 1 : -1;
    prevIndex = index < 0 ? prevIndex : index;
    setAnim((prev) => ({ tick: prev.tick + 1, direction }));
  });

  const swipeTo = (offset: 1 | -1) => {
    const target = neighbourTab(pathname, offset);
    if (target) router.navigate(target);
  };

  const swipe = Gesture.Race(
    Gesture.Fling()
      .direction(Directions.LEFT)
      .runOnJS(true)
      .onEnd(() => swipeTo(1)),
    Gesture.Fling()
      .direction(Directions.RIGHT)
      .runOnJS(true)
      .onEnd(() => swipeTo(-1)),
  );

  const entering = new Keyframe({
    0: { opacity: 0, transform: [{ translateX: 24 * anim.direction }] },
    100: { opacity: 1, transform: [{ translateX: 0 }] },
  }).duration(220);

  return (
    <GestureDetector gesture={swipe}>
      <Animated.View
        key={anim.tick}
        entering={entering}
        needsOffscreenAlphaCompositing
        style={styles.fill}
      >
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
