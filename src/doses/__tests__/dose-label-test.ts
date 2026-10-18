import { createInstance } from 'i18next';

import en from '@/config/i18n/locales/en.json';
import pl from '@/config/i18n/locales/pl.json';
import type { Translate } from '@/schedules/schedule-rhythm';

import {
  dayCountsText,
  doseQuantityText,
  durationText,
  handledCountsText,
  monthSummaryText,
  reminderBody,
} from '../dose-label';

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
    const body = reminderBody('Vitamin D', 1, null, false, translator('en'));

    // then
    expect(body).toBe('Time to take Vitamin D');
  });

  it('keeps the multiplied body for several pieces without a unit', () => {
    // when
    const body = reminderBody('Vitamin D', 2, null, false, translator('en'));

    // then
    expect(body).toBe('Time to take 2 × Vitamin D');
  });

  it('names the amount with a unit, also for 1', () => {
    // when
    const body = reminderBody(
      'Vitamin D',
      1,
      'tablet',
      false,
      translator('en'),
    );

    // then
    expect(body).toBe('Time to take Vitamin D: 1 tablet');
  });

  it('uses the Polish plural form with a unit', () => {
    // when
    const body = reminderBody('Witamina D', 5, 'drop', false, translator('pl'));

    // then
    expect(body).toBe('Czas wziąć Witamina D: 5 kropli');
  });

  it('appends the fasting note in Polish', () => {
    // when
    const body = reminderBody(
      'Euthyrox 50 µg',
      1,
      null,
      true,
      translator('pl'),
    );

    // then
    expect(body).toBe('Czas wziąć Euthyrox 50 µg · na czczo');
  });

  it('appends the fasting note after the amount in English', () => {
    // when
    const body = reminderBody('Euthyrox', 2, 'tablet', true, translator('en'));

    // then
    expect(body).toBe('Time to take Euthyrox: 2 tablets · on an empty stomach');
  });
});

describe('durationText', () => {
  it.each([
    [10 * 60 * 1000, '10 min'],
    [60 * 60 * 1000, '1 h'],
    [110 * 60 * 1000, '1 h 50 min'],
    [20 * 1000, '1 min'],
  ])('formats %i ms as %s', (durationMs, expected) => {
    // when
    const text = durationText(durationMs, translator('pl'));

    // then
    expect(text).toBe(expected);
  });
});

describe('dayCountsText', () => {
  it('lists the taken share and only the non-empty groups in Polish', () => {
    // given
    const counts = { total: 5, taken: 1, skipped: 1, overdue: 1, planned: 2 };

    // when
    const text = dayCountsText(counts, translator('pl'));

    // then
    expect(text).toBe('1 z 5 wzięta · 1 pominięta · 1 zaległa · 2 później');
  });

  it('declines the participles by count', () => {
    // given
    const counts = { total: 9, taken: 5, skipped: 2, overdue: 0, planned: 0 };

    // when
    const text = dayCountsText(counts, translator('pl'));

    // then
    expect(text).toBe('5 z 9 wziętych · 2 pominięte');
  });

  it('lists the groups in English', () => {
    // given
    const counts = { total: 5, taken: 1, skipped: 1, overdue: 1, planned: 2 };

    // when
    const text = dayCountsText(counts, translator('en'));

    // then
    expect(text).toBe('1 of 5 taken · 1 skipped · 1 overdue · 2 later');
  });
});

describe('handledCountsText', () => {
  it('joins taken and skipped counts', () => {
    // when
    const text = handledCountsText(4, 1, translator('pl'));

    // then
    expect(text).toBe('4 wzięte · 1 pominięta');
  });

  it('leaves out an empty group', () => {
    // when
    const text = handledCountsText(0, 2, translator('pl'));

    // then
    expect(text).toBe('2 pominięte');
  });
});

describe('monthSummaryText', () => {
  it('summarizes the month up to today', () => {
    // given
    const summary = {
      taken: 49,
      due: 52,
      skipped: 2,
      missed: 1,
      throughToday: true,
    };

    // when
    const text = monthSummaryText(summary, 'Październik', translator('pl'));

    // then
    expect(text).toBe(
      'Październik: 49 z 52 dawek wziętych · 2 pominięte · 1 nieodhaczona · do dziś',
    );
  });

  it('omits empty groups and the "until today" note for a past month', () => {
    // given
    const summary = {
      taken: 1,
      due: 1,
      skipped: 0,
      missed: 0,
      throughToday: false,
    };

    // when
    const text = monthSummaryText(summary, 'Wrzesień', translator('pl'));

    // then
    expect(text).toBe('Wrzesień: 1 z 1 dawki wziętej');
  });

  it('says so when nothing was due', () => {
    // given
    const summary = {
      taken: 0,
      due: 0,
      skipped: 0,
      missed: 0,
      throughToday: false,
    };

    // when
    const text = monthSummaryText(summary, 'November', translator('en'));

    // then
    expect(text).toBe('November: no doses to summarize');
  });
});
