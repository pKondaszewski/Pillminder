// Reanimated shared values are mutated through `.value` by design.
/* eslint-disable react-hooks/immutability */
import { Image } from 'expo-image';
import { useEffect } from 'react';
import { StyleSheet } from 'react-native';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import {
  canPanHorizontally,
  clampScale,
  clampTranslation,
  doubleTapScale,
  MIN_SCALE,
  translationAfterZoom,
} from './photo-zoom';

const PAN_DECISION_DISTANCE = 8;
const ZOOM_ANIMATION_MS = 200;

type Props = {
  uri: string;
  width: number;
  height: number;
  active: boolean;
};

export function ZoomablePhoto({ uri, width, height, active }: Props) {
  const scale = useSharedValue(MIN_SCALE);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const startScale = useSharedValue(MIN_SCALE);
  const startX = useSharedValue(0);
  const startY = useSharedValue(0);
  const touchX = useSharedValue(0);
  const touchY = useSharedValue(0);
  const view = { width, height };

  useEffect(() => {
    if (active) return;
    scale.value = MIN_SCALE;
    translateX.value = 0;
    translateY.value = 0;
  }, [active, scale, translateX, translateY]);

  const pinch = Gesture.Pinch()
    .onStart(() => {
      startScale.value = scale.value;
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const next = clampScale(startScale.value * event.scale);
      const moved = translationAfterZoom(
        { x: startX.value, y: startY.value },
        startScale.value,
        next,
        { x: event.focalX - width / 2, y: event.focalY - height / 2 },
        view,
      );
      scale.value = next;
      translateX.value = moved.x;
      translateY.value = moved.y;
    });

  // Manual activation: below the zoom, or at the edge in the drag direction,
  // the pan fails so the surrounding list gets the swipe.
  const pan = Gesture.Pan()
    .maxPointers(1)
    .manualActivation(true)
    .onTouchesDown((event) => {
      touchX.value = event.allTouches[0].absoluteX;
      touchY.value = event.allTouches[0].absoluteY;
    })
    .onTouchesMove((event, manager) => {
      const dx = event.allTouches[0].absoluteX - touchX.value;
      const dy = event.allTouches[0].absoluteY - touchY.value;
      if (Math.hypot(dx, dy) < PAN_DECISION_DISTANCE) return;
      const zoomed = scale.value > MIN_SCALE;
      const horizontalHandOver =
        Math.abs(dx) > Math.abs(dy) &&
        !canPanHorizontally(translateX.value, scale.value, view, dx);
      if (zoomed && !horizontalHandOver) manager.activate();
      else manager.fail();
    })
    .onStart(() => {
      startX.value = translateX.value;
      startY.value = translateY.value;
    })
    .onUpdate((event) => {
      const moved = clampTranslation(
        {
          x: startX.value + event.translationX,
          y: startY.value + event.translationY,
        },
        scale.value,
        view,
      );
      translateX.value = moved.x;
      translateY.value = moved.y;
    });

  const doubleTap = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd((event) => {
      const next = doubleTapScale(scale.value);
      const moved = translationAfterZoom(
        { x: translateX.value, y: translateY.value },
        scale.value,
        next,
        { x: event.x - width / 2, y: event.y - height / 2 },
        view,
      );
      scale.value = withTiming(next, { duration: ZOOM_ANIMATION_MS });
      translateX.value = withTiming(moved.x, { duration: ZOOM_ANIMATION_MS });
      translateY.value = withTiming(moved.y, { duration: ZOOM_ANIMATION_MS });
    });

  const gesture = Gesture.Race(doubleTap, Gesture.Simultaneous(pinch, pan));

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { scale: scale.value },
    ],
  }));

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View style={[{ width, height }, animatedStyle]}>
        <Image source={{ uri }} style={styles.fill} contentFit="contain" />
      </Animated.View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
