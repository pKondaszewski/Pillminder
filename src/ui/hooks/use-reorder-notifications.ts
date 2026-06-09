import { useEffect } from 'react';

import i18n from '@/config/i18n';
import type { products as productsTable } from '@/config/db/schema';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import {
  cancelReorderAlert,
  scheduleReorderAlert,
} from '@/notifications/notification-service';

import { useProducts } from './use-products';
import { useReorderStatuses } from './use-reorder';

type Product = typeof productsTable.$inferSelect;

export function useReorderNotifications() {
  const { products } = useProducts();
  const reorderStatuses = useReorderStatuses();

  useEffect(() => {
    void syncReorderAlerts(products ?? [], reorderStatuses);
  }, [products, reorderStatuses]);
}

function syncReorderAlerts(
  products: Product[],
  statuses: Record<string, ReorderStatus>,
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
          body: i18n.t('notification.reorderBody', { name: product.name }),
        },
      );
    }),
  );
}
