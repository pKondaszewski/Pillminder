import { createInstance } from 'i18next';

import en from '@/config/i18n/locales/en.json';
import pl from '@/config/i18n/locales/pl.json';
import type { Translate } from '@/schedules/schedule-rhythm';

import { doseQuantityText, reminderBody } from '../dose-label';

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

describe('doseQuantityText', () => {
  it('hides the quantity of 1 without a unit', () => {
    // when
    const text = doseQuantityText(1, null, translator('pl'));

    // then
    expect(text).toBeNull();
  });

  it('keeps the "×" form without a unit', () => {
    // when
    const text = doseQuantityText(2, null, translator('pl'));

    // then
    expect(text).toBe('× 2');
  });

  it('shows the quantity of 1 with a unit', () => {
    // when
    const text = doseQuantityText(1, 'tablet', translator('en'));

    // then
    expect(text).toBe('1 tablet');
  });

  it('uses the Polish plural form with a unit', () => {
    // when
    const text = doseQuantityText(3, 'capsule', translator('pl'));

    // then
    expect(text).toBe('3 kapsułki');
  });
});

describe('reminderBody', () => {
  it('keeps the plain body for a single piece without a unit', () => {
    // when
    const body = reminderBody('Vitamin D', 1, null, translator('en'));

    // then
    expect(body).toBe('Time to take Vitamin D');
  });

  it('keeps the multiplied body for several pieces without a unit', () => {
    // when
    const body = reminderBody('Vitamin D', 2, null, translator('en'));

    // then
    expect(body).toBe('Time to take 2 × Vitamin D');
  });

  it('names the amount with a unit, also for 1', () => {
    // when
    const body = reminderBody('Vitamin D', 1, 'tablet', translator('en'));

    // then
    expect(body).toBe('Time to take Vitamin D: 1 tablet');
  });

  it('uses the Polish plural form with a unit', () => {
    // when
    const body = reminderBody('Witamina D', 5, 'drop', translator('pl'));

    // then
    expect(body).toBe('Czas wziąć Witamina D: 5 kropli');
  });
});
