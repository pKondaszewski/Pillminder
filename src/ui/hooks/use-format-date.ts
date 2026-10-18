import { getLocales } from 'expo-localization';
import { useTranslation } from 'react-i18next';

import { formatLongDate, resolveDateLocale } from '@/ui/commons/format-date';

export function useFormatDate(): (date: Date, withWeekday?: boolean) => string {
  const { i18n } = useTranslation();
  const locale = resolveDateLocale(
    i18n.language,
    getLocales()[0]?.regionCode ?? null,
  );
  return (date, withWeekday) =>
    formatLongDate(date, locale, new Date(), withWeekday);
}
