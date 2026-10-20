import { useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { useReducedMotion } from 'react-native-reanimated';

import { tapHaptic } from '@/commons/ui/haptics';
import {
  type MeadowEvent,
  meadowEvents,
  type MeadowMark,
} from '@/scene/scene-service';

export const MEADOW_EVENT_MS = 900;

export function useMeadowEvents(marks: MeadowMark[]): MeadowEvent[] {
  const focused = useIsFocused();
  const reduceMotion = useReducedMotion();
  const previous = useRef<MeadowMark[] | null>(null);
  const nextKey = useRef(0);
  const timers = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const [events, setEvents] = useState<MeadowEvent[]>([]);

  useEffect(() => {
    const before = previous.current;
    previous.current = marks;
    if (!focused) return;
    const added = meadowEvents(before, marks, nextKey.current);
    if (added.length === 0) return;
    nextKey.current += added.length;
    tapHaptic();
    if (reduceMotion) return;
    setEvents((current) => [...current, ...added]);
    const timer = setTimeout(() => {
      timers.current.delete(timer);
      setEvents((current) => current.filter((event) => !added.includes(event)));
    }, MEADOW_EVENT_MS);
    timers.current.add(timer);
  }, [marks, focused, reduceMotion]);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  }, []);

  return events;
}
