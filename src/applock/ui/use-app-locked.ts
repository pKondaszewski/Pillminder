import { useSyncExternalStore } from 'react';

import { useSettings } from '@/settings/ui/use-settings';

import { isAppLocked, subscribeToAppLock } from '../app-lock-state';

export function useAppLocked(): boolean {
  const enabled = useSettings().appLockEnabled;
  const locked = useSyncExternalStore(subscribeToAppLock, isAppLocked);
  return enabled && locked;
}
