import { Appearance } from 'react-native';

import i18n, { resolveLanguage } from '@/config/i18n';
import type { Coords, StoredLocation } from '@/location/dto/coords';

import type {
  Currency,
  LanguagePreference,
  ThemePreference,
} from './dto/settings';
import { getSettings, updateSettings } from './settings-store';

export {
  type Currency,
  CURRENCY_OPTIONS,
  LANGUAGE_OPTIONS,
  type LanguagePreference,
  type Settings,
  THEME_OPTIONS,
  type ThemePreference,
} from './dto/settings';

export function applyStoredTheme(): void {
  applyTheme(getSettings().theme);
}

export function setTheme(theme: ThemePreference): void {
  updateSettings({ theme });
  applyTheme(theme);
}

export function setLanguage(language: LanguagePreference): void {
  updateSettings({ language });
  void i18n.changeLanguage(resolveLanguage(language));
}

export function setSnoozeMinutes(snoozeMinutes: number): void {
  updateSettings({ snoozeMinutes });
}

export function setCurrency(currency: Currency): void {
  updateSettings({ currency });
}

export function dismissNotificationsPrompt(): void {
  updateSettings({ notificationsPromptDismissed: true });
}

export function isNotificationsPromptDismissed(): boolean {
  return getSettings().notificationsPromptDismissed;
}

export function dismissBatteryPrompt(): void {
  updateSettings({ batteryPromptDismissed: true });
}

export function isBatteryPromptDismissed(): boolean {
  return getSettings().batteryPromptDismissed;
}

export function dismissLocationPrompt(): void {
  updateSettings({ locationPromptDismissed: true });
}

export function isLocationPromptDismissed(): boolean {
  return getSettings().locationPromptDismissed;
}

export function saveLocation(coords: Coords, now: number): void {
  updateSettings({ location: { ...coords, savedAt: now } });
}

export function clearLocation(): void {
  updateSettings({ location: null });
}

export function getStoredLocation(): StoredLocation | null {
  return getSettings().location;
}

export function getSnoozeMinutes(): number {
  return getSettings().snoozeMinutes;
}

function applyTheme(theme: ThemePreference): void {
  // Appearance drives useColorScheme(), so every consumer follows the override
  Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
}
