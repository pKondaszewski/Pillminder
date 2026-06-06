import { getLocales } from 'expo-localization';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import pl from './locales/pl.json';

export const SUPPORTED_LANGUAGES = ['en', 'pl'] as const;
export const FALLBACK_LANGUAGE = 'en';

const resources = {
  en: { translation: en },
  pl: { translation: pl },
};

const deviceLanguage = getLocales()[0]?.languageCode ?? FALLBACK_LANGUAGE;
const language = SUPPORTED_LANGUAGES.includes(
  deviceLanguage as (typeof SUPPORTED_LANGUAGES)[number],
)
  ? deviceLanguage
  : FALLBACK_LANGUAGE;

// eslint-disable-next-line import/no-named-as-default-member
i18n.use(initReactI18next).init({
  resources,
  lng: language,
  fallbackLng: FALLBACK_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;
