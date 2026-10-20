import { useEffect } from 'react';
import { Easing, useSharedValue, withTiming } from 'react-native-reanimated';

const CELEBRATION_MS = 1300;

export function useCelebrationProgress(
  celebrationKey: number,
  reduceMotion: boolean,
) {
  const burst = useSharedValue(0);

  useEffect(() => {
    if (celebrationKey === 0 || reduceMotion) return;
    burst.value = 0;
    burst.value = withTiming(1, {
      duration: CELEBRATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [celebrationKey, reduceMotion, burst]);

  return burst;
}
