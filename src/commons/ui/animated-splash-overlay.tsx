import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import Animated, { Easing, Keyframe } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { FontFamily } from '@/commons/ui/constants/fonts';
import { Colors, Spacing } from '@/commons/ui/constants/theme';

const DURATION = 600;

export function AnimatedSplashOverlay() {
  const [visible, setVisible] = useState(true);

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
      entering={splashKeyframe.duration(DURATION).withCallback((finished) => {
        'worklet';
        if (finished) {
          scheduleOnRN(setVisible, false);
        }
      })}
      style={styles.backgroundSolidColor}
    >
      <Image
        source={splashIcon}
        accessibilityIgnoresInvertColors
        style={styles.mark}
      />
      <Text style={styles.wordmark} numberOfLines={1}>
        {Constants.expoConfig?.name}
      </Text>
    </Animated.View>
  );
}

const splashIcon = require('../../../assets/images/splash-icon.png');

// Must match imageWidth of the expo-splash-screen plugin in app.json
const SPLASH_IMAGE_WIDTH = 76;

const WORDMARK_WIDTH = 240;

const styles = StyleSheet.create({
  backgroundSolidColor: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.accent,
    zIndex: 1000,
  },
  mark: {
    width: SPLASH_IMAGE_WIDTH,
    height: SPLASH_IMAGE_WIDTH,
  },
  // Out of the layout flow so the mark stays at the exact centre where the native splash draws it
  wordmark: {
    position: 'absolute',
    top: '50%',
    marginTop: SPLASH_IMAGE_WIDTH / 2 + Spacing.sixteen,
    width: WORDMARK_WIDTH,
    textAlign: 'center',
    fontFamily: FontFamily.semiBold,
    fontSize: 26,
    lineHeight: 32,
    color: Colors.light.onAccent,
  },
});
