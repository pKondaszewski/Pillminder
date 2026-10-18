import { getCalendars, getLocales } from 'expo-localization';
import { useTranslation } from 'react-i18next';

import {
  type ClockFormat,
  formatDateTime,
  formatLongDate,
  formatTime,
  formatTimeOfDay,
  formatTimesOfDay,
  is24HourClock,
  resolveDateLocale,
} from '@/ui/commons/format-date';

export function useDateLocale(): string {
  const { i18n } = useTranslation();
  return resolveDateLocale(i18n.language, getLocales()[0]?.regionCode ?? null);
}

export function useFormatDate(): (date: Date, withWeekday?: boolean) => string {
  const locale = useDateLocale();
  return (date, withWeekday) =>
    formatLongDate(date, locale, new Date(), withWeekday);
}

export type TimeFormatter = {
  formatTime: (date: Date) => string;
  formatTimeOfDay: (time: string) => string;
  formatTimes: (times: string[]) => string;
  formatDateTime: (date: Date) => string;
  is24Hour: boolean;
};

export function useFormatTime(): TimeFormatter {
  const locale = useDateLocale();
  const clock: ClockFormat = {
    locale,
    uses24hourClock: getCalendars()[0]?.uses24hourClock ?? null,
  };
  return {
    formatTime: (date) => formatTime(date, clock),
    formatTimeOfDay: (time) => formatTimeOfDay(time, clock),
    formatTimes: (times) => formatTimesOfDay(times, clock),
    formatDateTime: (date) => formatDateTime(date, clock),
    is24Hour: is24HourClock(clock),
  };
}
