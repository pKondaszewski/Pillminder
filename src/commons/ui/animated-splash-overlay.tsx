import { useState } from 'react';
import { StyleSheet } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { SplashView } from '@/commons/ui/splash-view';

const DURATION = 600;

export function AnimatedSplashOverlay({ frozen }: { frozen: boolean }) {
  const [visible, setVisible] = useState(true);

  if (frozen && !visible) setVisible(true);
  if (!visible) return null;

  const splashKeyframe = new Keyframe({
    0: {
      opacity: 1,
    },
    20: {
      opacity: 1,
    },
    70: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
    100: {
      opacity: 0,
      easing: Easing.elastic(0.7),
    },
  });

  return (
    <Animated.View
      key={frozen ? 'frozen' : 'playing'}
      entering={
        frozen
          ? undefined
          : splashKeyframe.duration(DURATION).withCallback((finished) => {
              'worklet';
              if (finished) {
                scheduleOnRN(setVisible, false);
              }
            })
      }
      style={styles.overlay}
    >
      <SplashView />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    zIndex: 1000,
  },
});
