import type { TFunction } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  cancelReorderAlert,
  getReorderAlertedAt,
  scheduleReorderAlert,
  showReorderAlert,
} from '@/notifications/notification-service';
import { reorderAlertAction } from '@/notifications/reorder-alert-action';
import { reorderNotificationText } from '@/notifications/reorder-text';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import type { Product } from '@/products/product-service';
import type { Currency } from '@/settings/settings-store';

import { useProducts } from './use-products';
import { useReorderStatuses } from './use-reorder';
import { useSettings } from './use-settings';

export function useReorderNotifications() {
  const { products } = useProducts();
  const reorderStatuses = useReorderStatuses();
  const { currency } = useSettings();
  const { t, i18n } = useTranslation();

  useEffect(() => {
    void syncReorderAlerts(
      products,
      reorderStatuses,
      currency,
      i18n.language,
      t,
    );
  }, [products, reorderStatuses, currency, i18n.language, t]);
}

function syncReorderAlerts(
  products: Product[],
  statuses: Record<string, ReorderStatus>,
  currency: Currency,
  locale: string,
  t: TFunction,
): Promise<unknown> {
  const now = new Date();
  return Promise.all(
    products.map(async (product) => {
      const reorderAt = statuses[product.id]?.reorderAt ?? null;
      const alertedAt = getReorderAlertedAt(product.id);
      const action = reorderAlertAction(reorderAt, alertedAt, now);
      if (action.kind === 'keep') return;
      if (action.kind === 'cancel') return cancelReorderAlert(product.id);

      const alert = {
        productId: product.id,
        productName: product.name,
        storeLink: product.storeLink,
        canAddPack: product.packSize !== null,
      };
      const text = reorderNotificationText(product, currency, locale, t);

      await cancelReorderAlert(product.id);
      return action.kind === 'reschedule'
        ? scheduleReorderAlert(alert, action.at, text)
        : showReorderAlert(alert, text);
    }),
  );
}
