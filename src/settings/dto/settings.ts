import type { StoredLocation } from '@/location/dto/coords';
import { SEASONS } from '@/scene/scene-service';

export const LANGUAGE_OPTIONS = ['system', 'pl', 'en'] as const;

export const THEME_OPTIONS = ['system', 'light', 'dark'] as const;

export const SEASON_OPTIONS = ['auto', ...SEASONS] as const;

export type LanguagePreference = (typeof LANGUAGE_OPTIONS)[number];

export type ThemePreference = (typeof THEME_OPTIONS)[number];

export type SeasonPreference = (typeof SEASON_OPTIONS)[number];

export interface Settings {
  language: LanguagePreference;
  theme: ThemePreference;
  seasonPreference: SeasonPreference;
  snoozeMinutes: number;
  notificationsPromptDismissed: boolean;
  batteryPromptDismissed: boolean;
  locationPromptDismissed: boolean;
  googleBackupConfirmed: boolean;
  location: StoredLocation | null;
  appLockEnabled: boolean;
}
