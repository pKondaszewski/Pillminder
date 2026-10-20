import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import {
  Easing,
  type SharedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const ENTRY_DURATION_MS = 1600;

export function useEntryProgress(replayKey?: string): SharedValue<number> {
  const focused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    if (!focused) return;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: ENTRY_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, replayKey, reduceMotion, progress]);

  return progress;
}
