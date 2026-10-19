import type { StoredLocation } from '@/location/dto/coords';

export const LANGUAGE_OPTIONS = ['system', 'pl', 'en'] as const;

export const THEME_OPTIONS = ['system', 'light', 'dark'] as const;

export const CURRENCY_OPTIONS = ['USD', 'EUR', 'PLN', 'GBP'] as const;

export type LanguagePreference = (typeof LANGUAGE_OPTIONS)[number];

export type ThemePreference = (typeof THEME_OPTIONS)[number];

export type Currency = (typeof CURRENCY_OPTIONS)[number];

export interface Settings {
  language: LanguagePreference;
  theme: ThemePreference;
  snoozeMinutes: number;
  currency: Currency;
  notificationsPromptDismissed: boolean;
  batteryPromptDismissed: boolean;
  locationPromptDismissed: boolean;
  location: StoredLocation | null;
}
