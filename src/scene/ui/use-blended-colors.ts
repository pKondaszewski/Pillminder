import { useEffect } from 'react';
import {
  type DerivedValue,
  interpolateColor,
  type SharedValue,
  useDerivedValue,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const BLEND_DURATION_MS = 1200;

export function useBlendedColors(targets: string[]): SharedValue<string[]> {
  const reduceMotion = useReducedMotion();
  const from = useSharedValue(targets);
  const to = useSharedValue(targets);
  const mix = useSharedValue(1);
  const blended = useDerivedValue(() =>
    to.value.map((color, index) =>
      interpolateColor(mix.value, [0, 1], [from.value[index], color]),
    ),
  );
  const key = targets.join();

  useEffect(() => {
    from.set(blended.get());
    to.set(targets);
    mix.set(0);
    mix.set(withTiming(1, { duration: reduceMotion ? 0 : BLEND_DURATION_MS }));
    // targets is covered by key
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, reduceMotion]);

  return blended;
}

export function useColorAt(
  colors: SharedValue<string[]>,
  index: number,
): DerivedValue<string> {
  return useDerivedValue(() => colors.value[index]);
}
