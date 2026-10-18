import type { Translate } from '@/schedules/schedule-rhythm';
import { formatPrice } from '@/settings/format-price';
import type { Currency } from '@/settings/settings-store';

import type { NotificationText } from './dto/notification-text';

export function reorderNotificationText(
  product: { name: string; price: number | null },
  currency: Currency,
  locale: string,
  t: Translate,
): NotificationText {
  const { name, price } = product;
  return {
    title: t('notification.reorderTitle'),
    body:
      price === null
        ? t('notification.reorderBody', { name })
        : t('notification.reorderBodyWithPrice', {
            name,
            price: formatPrice(price, currency, locale),
          }),
  };
}
