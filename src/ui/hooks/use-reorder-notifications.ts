import type { TFunction } from 'i18next';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import type { products as productsTable } from '@/config/db/schema';
import {
  cancelReorderAlert,
  scheduleReorderAlert,
} from '@/notifications/notification-service';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import type { Currency } from '@/settings/settings-store';

import { useProducts } from './use-products';
import { useReorderStatuses } from './use-reorder';
import { useSettings } from './use-settings';

type Product = typeof productsTable.$inferSelect;

export function useReorderNotifications() {
  const { products } = useProducts();
  const reorderStatuses = useReorderStatuses();
  const { currency } = useSettings();
  const { t } = useTranslation();

  useEffect(() => {
    void syncReorderAlerts(products, reorderStatuses, currency, t);
  }, [products, reorderStatuses, currency, t]);
}

function syncReorderAlerts(
  products: Product[],
  statuses: Record<string, ReorderStatus>,
  currency: Currency,
  t: TFunction,
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
          title: t('notification.reorderTitle'),
          body:
            product.price === null
              ? t('notification.reorderBody', { name: product.name })
              : t('notification.reorderBodyWithPrice', {
                  name: product.name,
                  price: product.price,
                  currency,
                }),
        },
      );
    }),
  );
}
