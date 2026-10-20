import { createInstance } from 'i18next';

import en from '@/config/i18n/locales/en.json';
import pl from '@/config/i18n/locales/pl.json';
import type { Translate } from '@/config/translate';

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

describe('reorderNotificationText', () => {
  it('shows the typed price as is in Polish', () => {
    // given
    const product = { name: 'Magnez + B6', price: '12,99 zł' };

    // when
    const text = reorderNotificationText(product, translator('pl'));

    // then
    expect(text.body).toBe('Magnez + B6 się kończy - czas dokupić (12,99 zł)');
  });

  it('shows the typed price as is in English', () => {
    // given
    const product = { name: 'Magnesium', price: '15 euro' };

    // when
    const text = reorderNotificationText(product, translator('en'));

    // then
    expect(text.body).toBe(
      'Magnesium is running low - time to reorder (15 euro)',
    );
  });

  it('omits the price when the product has none', () => {
    // given
    const product = { name: 'Magnez + B6', price: null };

    // when
    const text = reorderNotificationText(product, translator('pl'));

    // then
    expect(text.body).toBe('Magnez + B6 się kończy - czas dokupić');
  });

  it('uses the reorder title', () => {
    // given
    const product = { name: 'Magnez + B6', price: null };

    // when
    const text = reorderNotificationText(product, translator('pl'));

    // then
    expect(text.title).toBe(pl.notification.reorderTitle);
  });
});
