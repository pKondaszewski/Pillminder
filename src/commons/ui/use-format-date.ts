import { getLocales } from 'expo-localization';
import { useTranslation } from 'react-i18next';

import { firstWeekdayOf } from '@/config/calendar-grid';
import {
  formatDateTime,
  formatLongDate,
  formatTime,
  formatTimeOfDay,
  formatTimesOfDay,
  is24HourClock,
  resolveDateLocale,
} from '@/config/format-date';
import type { SupportedLanguage } from '@/config/i18n';

export function useDateLocale(): string {
  const { i18n } = useTranslation();
  return resolveDateLocale(i18n.language, getLocales()[0]?.regionCode ?? null);
}

export function useFormatDate(): (date: Date, withWeekday?: boolean) => string {
  const locale = useDateLocale();
  return (date, withWeekday) =>
    formatLongDate(date, locale, new Date(), withWeekday);
}

export function useFirstWeekday(): number {
  const { language } = useTranslation().i18n;
  return firstWeekdayOf(language as SupportedLanguage);
}

export type TimeFormatter = {
  formatTime: (date: Date) => string;
  formatTimeOfDay: (time: string) => string;
  formatTimes: (times: string[]) => string;
  formatDateTime: (date: Date) => string;
  is24Hour: boolean;
};

export function useFormatTime(): TimeFormatter {
  const { language } = useTranslation().i18n;
  return {
    formatTime: (date) => formatTime(date, language),
    formatTimeOfDay: (time) => formatTimeOfDay(time, language),
    formatTimes: (times) => formatTimesOfDay(times, language),
    formatDateTime: (date) => formatDateTime(date, language),
    is24Hour: is24HourClock(language),
  };
}
