import { createInstance } from 'i18next';

import en from '@/config/i18n/locales/en.json';
import pl from '@/config/i18n/locales/pl.json';
import type { Translate } from '@/schedules/schedule-rhythm';

import { reorderNotificationText } from '../reorder-text';

function translator(lng: 'en' | 'pl'): Translate {
  const instance = createInstance();
  instance.init({
    lng,
    resources: { en: { translation: en }, pl: { translation: pl } },
    interpolation: { escapeValue: false },
    initAsync: false,
  });
  return (key, options) => instance.t(key, options);
}

function normalizeSpaces(text: string): string {
  return text.replace(/\s/g, ' ');
}

describe('reorderNotificationText', () => {
  it('shows the price with the currency symbol in Polish', () => {
    // given
    const product = { name: 'Magnez + B6', price: 25 };

    // when
    const text = reorderNotificationText(
      product,
      'PLN',
      'pl',
      translator('pl'),
    );

    // then
    expect(normalizeSpaces(text.body)).toBe(
      'Magnez + B6 się kończy - czas dokupić (25 zł)',
    );
  });

  it('shows the price with the currency symbol in English', () => {
    // given
    const product = { name: 'Magnesium', price: 25 };

    // when
    const text = reorderNotificationText(
      product,
      'USD',
      'en',
      translator('en'),
    );

    // then
    expect(text.body).toBe('Magnesium is running low - time to reorder ($25)');
  });

  it('omits the price when the product has none', () => {
    // given
    const product = { name: 'Magnez + B6', price: null };

    // when
    const text = reorderNotificationText(
      product,
      'PLN',
      'pl',
      translator('pl'),
    );

    // then
    expect(text.body).toBe('Magnez + B6 się kończy - czas dokupić');
  });

  it('uses the reorder title', () => {
    // given
    const product = { name: 'Magnez + B6', price: null };

    // when
    const text = reorderNotificationText(
      product,
      'PLN',
      'pl',
      translator('pl'),
    );

    // then
    expect(text.title).toBe(pl.notification.reorderTitle);
  });
});
