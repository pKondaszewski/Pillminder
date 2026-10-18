import {
  type ClockFormat,
  formatDateRange,
  formatDateTime,
  formatLongDate,
  formatTime,
  formatTimeOfDay,
  formatTimesOfDay,
  is24HourClock,
  resolveDateLocale,
  toTimeOfDay,
} from '../format-date';

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

describe('formatDateRange', () => {
  const END_OF_MONTH = new Date(2026, 9, 30);
  const NEXT_MONTH = new Date(2026, 10, 2);

  it('shares the month within one month in Polish', () => {
    // when
    const text = formatDateRange(DATE, END_OF_MONTH, 'pl', NOW);

    // then
    expect(text).toBe('24-30 października');
  });

  it('shares the month within one month in en-GB', () => {
    // when
    const text = formatDateRange(DATE, END_OF_MONTH, 'en-GB', NOW);

    // then
    expect(text).toBe('24-30 October');
  });

  it('shares the month within one month in en-US', () => {
    // when
    const text = formatDateRange(DATE, END_OF_MONTH, 'en-US', NOW);

    // then
    expect(text).toBe('October 24-30');
  });

  it('names both months across months in Polish', () => {
    // when
    const text = formatDateRange(DATE, NEXT_MONTH, 'pl', NOW);

    // then
    expect(text).toBe('24 października - 2 listopada');
  });

  it('names both months across months in en-GB', () => {
    // when
    const text = formatDateRange(DATE, NEXT_MONTH, 'en-GB', NOW);

    // then
    expect(text).toBe('24 October - 2 November');
  });

  it('names both months across months in en-US', () => {
    // when
    const text = formatDateRange(DATE, NEXT_MONTH, 'en-US', NOW);

    // then
    expect(text).toBe('October 24 - November 2');
  });

  it('shows a single date for a one-day range', () => {
    // when
    const text = formatDateRange(DATE, DATE, 'pl', NOW);

    // then
    expect(text).toBe('24 października');
  });
});

const clock = (
  locale: string,
  uses24hourClock: boolean | null = null,
): ClockFormat => ({ locale, uses24hourClock });

describe('formatTime', () => {
  it('pads hours in the 24 h clock', () => {
    // when
    const text = formatTime(new Date(2026, 9, 18, 7, 5), clock('pl', true));

    // then
    expect(text).toBe('07:05');
  });

  it('shows the afternoon in the 12 h clock', () => {
    // when
    const text = formatTime(
      new Date(2026, 9, 18, 14, 0),
      clock('en-US', false),
    );

    // then
    expect(text).toBe('2:00 PM');
  });

  it('turns midnight into 12:30 AM', () => {
    // when
    const text = formatTime(
      new Date(2026, 9, 18, 0, 30),
      clock('en-US', false),
    );

    // then
    expect(text).toBe('12:30 AM');
  });

  it('turns noon into 12:00 PM', () => {
    // when
    const text = formatTime(
      new Date(2026, 9, 18, 12, 0),
      clock('en-US', false),
    );

    // then
    expect(text).toBe('12:00 PM');
  });

  it('lets the phone setting override the locale', () => {
    // when
    const text = formatTime(new Date(2026, 9, 18, 14, 0), clock('en-US', true));

    // then
    expect(text).toBe('14:00');
  });
});

describe('is24HourClock', () => {
  it.each([
    ['en-US', null, false],
    ['en', null, false],
    ['en-GB', null, true],
    ['pl', null, true],
    ['pl-PL', false, false],
    ['en-GB', false, false],
  ])('for %s with phone setting %s is %s', (locale, phone, expected) => {
    // when
    const result = is24HourClock(clock(locale, phone));

    // then
    expect(result).toBe(expected);
  });
});

describe('formatTimeOfDay', () => {
  it('converts a stored HH:mm value', () => {
    // when
    const text = formatTimeOfDay('20:15', clock('en-US'));

    // then
    expect(text).toBe('8:15 PM');
  });

  it('joins several stored times', () => {
    // when
    const text = formatTimesOfDay(['08:00', '20:00'], clock('en-US'));

    // then
    expect(text).toBe('8:00 AM, 8:00 PM');
  });
});

describe('formatDateTime', () => {
  it('appends the time in the chosen clock', () => {
    // when
    const text = formatDateTime(new Date(2026, 9, 5, 14, 35), clock('en-US'));

    // then
    expect(text).toBe('05.10 · 2:35 PM');
  });
});

describe('toTimeOfDay', () => {
  it('always stores 24 h HH:mm', () => {
    // when
    const text = toTimeOfDay(new Date(2026, 9, 18, 9, 3));

    // then
    expect(text).toBe('09:03');
  });
});
