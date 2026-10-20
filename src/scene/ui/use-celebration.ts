import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';

import { successHaptic } from '@/commons/ui/haptics';
import { isCelebration, type SceneMood } from '@/scene/scene-service';

export function useCelebration(mood: SceneMood | null, dayKey: string): number {
  const focused = useIsFocused();
  const previous = useRef<{ dayKey: string; mood: SceneMood | null } | null>(
    null,
  );
  const [count, setCount] = useState(0);

  useEffect(() => {
    const before =
      previous.current?.dayKey === dayKey ? previous.current.mood : null;
    previous.current = { dayKey, mood };
    if (mood === null || !focused || !isCelebration(before, mood)) return;
    setCount((current) => current + 1);
    successHaptic();
  }, [mood, dayKey, focused]);

  return count;
}
