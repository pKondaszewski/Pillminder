import { createInstance } from 'i18next';

import en from '@/config/i18n/locales/en.json';
import pl from '@/config/i18n/locales/pl.json';
import type { Translate } from '@/schedules/schedule-rhythm';

import { formatAmount } from '../product-unit';

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

describe('formatAmount', () => {
  it.each([
    [1, 'tablet', '1 tablet'],
    [2, 'tablet', '2 tablets'],
    [1, 'capsule', '1 capsule'],
    [3, 'drop', '3 drops'],
    [5, 'ml', '5 ml'],
  ] as const)('formats %d %s in English', (count, unit, expected) => {
    // given
    const t = translator('en');

    // when
    const text = formatAmount(count, unit, t);

    // then
    expect(text).toBe(expected);
  });

  it.each([
    [1, 'tabletka'],
    [2, 'tabletki'],
    [4, 'tabletki'],
    [5, 'tabletek'],
    [12, 'tabletek'],
    [22, 'tabletki'],
  ])('uses the Polish plural form for %d tablets', (count, noun) => {
    // given
    const t = translator('pl');

    // when
    const text = formatAmount(count, 'tablet', t);

    // then
    expect(text).toBe(`${count} ${noun}`);
  });

  it.each([
    [1, 'capsule', '1 kapsułka'],
    [3, 'capsule', '3 kapsułki'],
    [10, 'capsule', '10 kapsułek'],
    [1, 'drop', '1 kropla'],
    [2, 'drop', '2 krople'],
    [8, 'drop', '8 kropli'],
    [5, 'ml', '5 ml'],
  ] as const)('formats %d %s in Polish', (count, unit, expected) => {
    // given
    const t = translator('pl');

    // when
    const text = formatAmount(count, unit, t);

    // then
    expect(text).toBe(expected);
  });
});
