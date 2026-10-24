import Storage from 'expo-sqlite/kv-store';

import {
  LANGUAGE_OPTIONS,
  SEASON_OPTIONS,
  type Settings,
  THEME_OPTIONS,
} from './dto/settings';
import { isValidStoredLocation } from './stored-location-validation';

export const SNOOZE_MINUTES_MIN = 1;
export const SNOOZE_MINUTES_MAX = 180;
export const SNOOZE_MINUTES_DEFAULT = 15;

const STORAGE_KEY = 'settings';

const DEFAULT_SETTINGS: Settings = {
  language: 'system',
  theme: 'system',
  seasonPreference: 'auto',
  snoozeMinutes: SNOOZE_MINUTES_DEFAULT,
  notificationsPromptDismissed: false,
  batteryPromptDismissed: false,
  locationPromptDismissed: false,
  location: null,
  appLockEnabled: false,
};

const IS_VALID: { [K in keyof Settings]: (value: unknown) => boolean } = {
  language: (value) => LANGUAGE_OPTIONS.some((option) => option === value),
  theme: (value) => THEME_OPTIONS.some((option) => option === value),
  seasonPreference: (value) =>
    SEASON_OPTIONS.some((option) => option === value),
  snoozeMinutes: isValidSnoozeMinutes,
  notificationsPromptDismissed: (value) => typeof value === 'boolean',
  batteryPromptDismissed: (value) => typeof value === 'boolean',
  locationPromptDismissed: (value) => typeof value === 'boolean',
  location: isValidStoredLocation,
  appLockEnabled: (value) => typeof value === 'boolean',
};

const listeners = new Set<() => void>();
let current: Settings = readStoredSettings();

export function getSettings(): Settings {
  return current;
}

export function updateSettings(patch: Partial<Settings>): void {
  current = { ...current, ...patch };
  Storage.setItemSync(STORAGE_KEY, JSON.stringify(current));
  listeners.forEach((listener) => listener());
}

export function subscribeToSettings(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function isValidSnoozeMinutes(value: unknown): value is number {
  return (
    Number.isInteger(value) &&
    (value as number) >= SNOOZE_MINUTES_MIN &&
    (value as number) <= SNOOZE_MINUTES_MAX
  );
}

function readStoredSettings(): Settings {
  try {
    const raw = Storage.getItemSync(STORAGE_KEY);
    const stored: Record<string, unknown> = raw ? JSON.parse(raw) : {};
    return {
      language: pick('language', stored),
      theme: pick('theme', stored),
      seasonPreference: pick('seasonPreference', stored),
      snoozeMinutes: pick('snoozeMinutes', stored),
      notificationsPromptDismissed: pick(
        'notificationsPromptDismissed',
        stored,
      ),
      batteryPromptDismissed: pick('batteryPromptDismissed', stored),
      locationPromptDismissed: pick('locationPromptDismissed', stored),
      location: pick('location', stored),
      appLockEnabled: pick('appLockEnabled', stored),
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function pick<K extends keyof Settings>(
  key: K,
  stored: Record<string, unknown>,
): Settings[K] {
  const value = stored[key];
  return IS_VALID[key](value) ? (value as Settings[K]) : DEFAULT_SETTINGS[key];
}
