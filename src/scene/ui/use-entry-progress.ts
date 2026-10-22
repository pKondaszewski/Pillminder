import { useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import {
  Easing,
  type SharedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { useAppLocked } from '@/applock/ui/use-app-locked';

const ENTRY_DURATION_MS = 1600;

export function useEntryProgress(replayKey?: string): SharedValue<number> {
  const focused = useIsFocused();
  const locked = useAppLocked();
  const reduceMotion = useReducedMotion();
  const progress = useSharedValue(reduceMotion ? 1 : 0);

  useEffect(() => {
    if (reduceMotion) {
      progress.value = 1;
      return;
    }
    if (!focused || locked) return;
    progress.value = 0;
    progress.value = withTiming(1, {
      duration: ENTRY_DURATION_MS,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, locked, replayKey, reduceMotion, progress]);

  return progress;
}
