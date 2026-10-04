import { Appearance } from 'react-native';

import i18n, { resolveLanguage } from '@/config/i18n';

import {
  type Currency,
  getSettings,
  type LanguagePreference,
  type ThemePreference,
  updateSettings,
} from './settings-store';

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

export function getSnoozeMinutes(): number {
  return getSettings().snoozeMinutes;
}

function applyTheme(theme: ThemePreference): void {
  // Appearance drives useColorScheme(), so every consumer follows the override
  Appearance.setColorScheme(theme === 'system' ? 'unspecified' : theme);
}
