import { useSyncExternalStore } from 'react';

import {
  getSettings,
  type Settings,
  subscribeToSettings,
} from '@/settings/settings-store';

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeToSettings, getSettings);
}
