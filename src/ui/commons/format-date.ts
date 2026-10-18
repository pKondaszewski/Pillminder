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
  return longDateFormat(date, locale, now, withWeekday).format(date);
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
      type === 'day' ? `${from.getDate()}-${value}` : value,
    )
    .join('');
}

export function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

export function formatDateTime(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month} · ${formatTime(date)}`;
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
