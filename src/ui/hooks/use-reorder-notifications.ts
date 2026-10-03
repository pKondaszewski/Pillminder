import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { products as productsTable } from '@/config/db/schema';
import i18n from '@/config/i18n';
import {
  cancelReorderAlert,
  scheduleReorderAlert,
} from '@/notifications/notification-service';
import type { ReorderStatus } from '@/products/dto/reorder-status';

import { useProducts } from './use-products';
import { useReorderStatuses } from './use-reorder';
import { useSettings } from './use-settings';

type Product = typeof productsTable.$inferSelect;

export function useReorderNotifications() {
  const { products } = useProducts();
  const reorderStatuses = useReorderStatuses();
  const { currency } = useSettings();
  const { i18n: i18nInstance } = useTranslation();
  const language = i18nInstance.language;

  useEffect(() => {
    void syncReorderAlerts(products ?? [], reorderStatuses, currency);
  }, [products, reorderStatuses, currency, language]);
}

function syncReorderAlerts(
  products: Product[],
  statuses: Record<string, ReorderStatus>,
  currency: string,
): Promise<unknown> {
  return Promise.all(
    products.map((product) => {
      const reorderAt = statuses[product.id]?.reorderAt ?? null;
      if (!reorderAt || reorderAt.getTime() <= Date.now()) {
        return cancelReorderAlert(product.id);
      }
      return scheduleReorderAlert(
        {
          productId: product.id,
          productName: product.name,
          storeLink: product.storeLink,
          reorderAt,
        },
        {
          title: i18n.t('notification.reorderTitle'),
          body:
            product.price === null
              ? i18n.t('notification.reorderBody', { name: product.name })
              : i18n.t('notification.reorderBodyWithPrice', {
                  name: product.name,
                  price: product.price,
                  currency,
                }),
        },
      );
    }),
  );
}
