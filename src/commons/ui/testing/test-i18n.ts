import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from '@/config/i18n/locales/en.json';

// The app's own i18n module reads the settings from the db, so tests set up a bare English instance.
// eslint-disable-next-line import/no-named-as-default-member
void i18n.use(initReactI18next).init({
  resources: { en: { translation: en } },
  lng: 'en',
  interpolation: { escapeValue: false },
});

// eslint-disable-next-line import/no-named-as-default-member
export const translate = i18n.getFixedT('en');
