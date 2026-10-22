import type { StoredLocation } from '@/location/dto/coords';

export const LANGUAGE_OPTIONS = ['system', 'pl', 'en'] as const;

export const THEME_OPTIONS = ['system', 'light', 'dark'] as const;

export type LanguagePreference = (typeof LANGUAGE_OPTIONS)[number];

export type ThemePreference = (typeof THEME_OPTIONS)[number];

export const TUTORIAL_STEPS = [
  'intro',
  'product',
  'schedule',
  'hint',
  'done',
] as const;

export type TutorialStep = (typeof TUTORIAL_STEPS)[number];

export interface Settings {
  language: LanguagePreference;
  theme: ThemePreference;
  snoozeMinutes: number;
  notificationsPromptDismissed: boolean;
  batteryPromptDismissed: boolean;
  locationPromptDismissed: boolean;
  location: StoredLocation | null;
  tutorialStep: TutorialStep;
}
