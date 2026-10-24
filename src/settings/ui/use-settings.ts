import { useSyncExternalStore } from 'react';

import {
  getSettings,
  type Settings,
  subscribeToSettings,
} from '@/settings/settings-service';

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeToSettings, getSettings);
}
