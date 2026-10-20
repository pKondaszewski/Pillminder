import { useIsFocused } from 'expo-router';
import { useEffect, useState } from 'react';
import { AppState } from 'react-native';
import {
  cancelAnimation,
  Easing,
  type SharedValue,
  useReducedMotion,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

const SCENE_LOOP_MS = 48 * 1000;

type SceneClock = {
  time: SharedValue<number>;
  active: boolean;
  reduceMotion: boolean;
};

export function useSceneClock(): SceneClock {
  const focused = useIsFocused();
  const foreground = useAppInForeground();
  const reduceMotion = useReducedMotion();
  const time = useSharedValue(0);
  const active = focused && foreground && !reduceMotion;

  useEffect(() => {
    if (!active) return;
    time.value = 0;
    time.value = withRepeat(
      withTiming(1, { duration: SCENE_LOOP_MS, easing: Easing.linear }),
      -1,
    );
    return () => cancelAnimation(time);
  }, [active, time]);

  return { time, active, reduceMotion };
}

function useAppInForeground(): boolean {
  const [foreground, setForeground] = useState(
    AppState.currentState === 'active',
  );

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) =>
      setForeground(state === 'active'),
    );
    return () => subscription.remove();
  }, []);

  return foreground;
}
