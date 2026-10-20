import type { Translate } from '@/config/translate';

import type { NotificationText } from './dto/notification-text';

export function reorderNotificationText(
  product: { name: string; price: string | null },
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
            price,
          }),
  };
}
