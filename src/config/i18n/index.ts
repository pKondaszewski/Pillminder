import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import {
  getSettings,
  type LanguagePreference,
} from '@/settings/settings-store';

import en from './locales/en.json';
import pl from './locales/pl.json';

export const SUPPORTED_LANGUAGES = ['en', 'pl'] as const;
export const FALLBACK_LANGUAGE = 'en';

const resources = {
  en: { translation: en },
  pl: { translation: pl },
};

export function resolveLanguage(preference: LanguagePreference): string {
  if (preference !== 'system') return preference;
  const deviceLanguage = getLocales()[0]?.languageCode ?? FALLBACK_LANGUAGE;
  return SUPPORTED_LANGUAGES.includes(
    deviceLanguage as (typeof SUPPORTED_LANGUAGES)[number],
  )
    ? deviceLanguage
    : FALLBACK_LANGUAGE;
}

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: resolveLanguage(getSettings().language),
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;
