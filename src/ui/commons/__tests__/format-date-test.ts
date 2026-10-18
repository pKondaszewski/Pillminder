import { formatLongDate, resolveDateLocale } from '../format-date';

const NOW = new Date(2026, 9, 18);
const DATE = new Date(2026, 9, 24);

describe('formatLongDate', () => {
  it('puts the day first with the genitive month in Polish', () => {
    // when
    const text = formatLongDate(DATE, 'pl', NOW);

    // then
    expect(text).toBe('24 października');
  });

  it('puts the day first in en-GB', () => {
    // when
    const text = formatLongDate(DATE, 'en-GB', NOW);

    // then
    expect(text).toBe('24 October');
  });

  it('puts the month first in en-US', () => {
    // when
    const text = formatLongDate(DATE, 'en-US', NOW);

    // then
    expect(text).toBe('October 24');
  });

  it('prefixes the short weekday in Polish', () => {
    // when
    const text = formatLongDate(DATE, 'pl', NOW, true);

    // then
    expect(text).toBe('sob., 24 października');
  });

  it('prefixes the short weekday in en-US', () => {
    // when
    const text = formatLongDate(DATE, 'en-US', NOW, true);

    // then
    expect(text).toBe('Sat, October 24');
  });

  it('adds the year when it is not the current one', () => {
    // given
    const nextYear = new Date(2027, 0, 5);

    // when
    const text = formatLongDate(nextYear, 'pl', NOW);

    // then
    expect(text).toBe('5 stycznia 2027');
  });
});

describe('resolveDateLocale', () => {
  it('combines English with the device region', () => {
    // when
    const locale = resolveDateLocale('en', 'GB');

    // then
    expect(locale).toBe('en-GB');
  });

  it('leaves the language alone without a region', () => {
    // when
    const locale = resolveDateLocale('en', null);

    // then
    expect(locale).toBe('en');
  });

  it('lets Intl pick the variant for an English region without its own data', () => {
    // given
    const locale = resolveDateLocale('en', 'PL');

    // when
    const text = formatLongDate(DATE, locale, NOW);

    // then
    expect(text).toBe('24 October');
  });

  it('combines Polish with the device region', () => {
    // when
    const locale = resolveDateLocale('pl', 'PL');

    // then
    expect(locale).toBe('pl-PL');
  });
});
