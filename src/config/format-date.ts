const ORDINAL_SUFFIXES: Partial<Record<Intl.LDMLPluralRule, string>> = {
  one: 'st',
  two: 'nd',
  few: 'rd',
  other: 'th',
};

export function resolveDateLocale(
  language: string,
  region: string | null,
): string {
  return region ? `${language}-${region}` : language;
}

export function formatLongDate(
  date: Date,
  locale: string,
  now: Date,
  withWeekday = false,
): string {
  return longDateFormat(date, locale, now, withWeekday)
    .formatToParts(date)
    .map(({ type, value }) =>
      type === 'day' ? withOrdinal(date.getDate(), locale) : value,
    )
    .join('');
}

export function formatDateRange(
  from: Date,
  to: Date,
  locale: string,
  now: Date,
): string {
  if (from.getTime() === to.getTime()) return formatLongDate(from, locale, now);
  const sameMonth =
    from.getFullYear() === to.getFullYear() &&
    from.getMonth() === to.getMonth();
  if (!sameMonth) {
    return `${formatLongDate(from, locale, now)} - ${formatLongDate(to, locale, now)}`;
  }
  return longDateFormat(to, locale, now, false)
    .formatToParts(to)
    .map(({ type, value }) =>
      type === 'day'
        ? `${withOrdinal(from.getDate(), locale)}-${withOrdinal(to.getDate(), locale)}`
        : value,
    )
    .join('');
}

export function is24HourClock(language: string): boolean {
  return !language.startsWith('en');
}

export function formatTime(date: Date, language: string): string {
  return formatClockTime(date.getHours(), date.getMinutes(), language);
}

export function formatTimeOfDay(time: string, language: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  return formatClockTime(hours, minutes, language);
}

export function formatTimesOfDay(times: string[], language: string): string {
  return times.map((time) => formatTimeOfDay(time, language)).join(', ');
}

export function formatDateTime(date: Date, language: string): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month} · ${formatTime(date, language)}`;
}

export function toTimeOfDay(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

function formatClockTime(
  hours: number,
  minutes: number,
  language: string,
): string {
  const mm = String(minutes).padStart(2, '0');
  if (is24HourClock(language)) return `${String(hours).padStart(2, '0')}:${mm}`;
  return `${hours % 12 || 12}:${mm} ${hours < 12 ? 'AM' : 'PM'}`;
}

function longDateFormat(
  date: Date,
  locale: string,
  now: Date,
  withWeekday: boolean,
): Intl.DateTimeFormat {
  const withYear = date.getFullYear() !== now.getFullYear();
  return new Intl.DateTimeFormat(locale, {
    ...(withWeekday && { weekday: 'short' }),
    day: 'numeric',
    month: 'long',
    ...(withYear && { year: 'numeric' }),
  });
}

function withOrdinal(day: number, locale: string): string {
  if (!locale.startsWith('en')) return String(day);
  return `${day}${ORDINAL_SUFFIXES[new Intl.PluralRules('en', { type: 'ordinal' }).select(day)] ?? 'th'}`;
}
