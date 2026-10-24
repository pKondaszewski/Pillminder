import { type EffectCallback, useEffect } from 'react';

// Stands in for expo-router's useFocusEffect: a mounted screen counts as focused.
export function useFocusEffect(effect: EffectCallback) {
  useEffect(effect, [effect]);
}
