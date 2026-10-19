import { useSyncExternalStore } from 'react';

import type { Settings } from '@/settings/settings-service';
import { getSettings, subscribeToSettings } from '@/settings/settings-store';

export function useSettings(): Settings {
  return useSyncExternalStore(subscribeToSettings, getSettings);
}
