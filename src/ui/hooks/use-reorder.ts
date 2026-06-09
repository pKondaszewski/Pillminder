import { useMemo } from 'react';

import type { ReorderStatus } from '@/products/dto/reorder-status';
import { reorderStatus } from '@/products/reorder';

import { useProducts } from './use-products';
import { useSchedules } from './use-schedules';

export function useReorderStatuses(): Record<string, ReorderStatus> {
  const { products } = useProducts();
  const { schedules } = useSchedules();

  return useMemo(() => {
    const byProduct: Record<string, ReorderStatus> = {};
    for (const product of products ?? []) {
      const rhythms = (schedules ?? []).filter(
        (schedule) => schedule.productId === product.id,
      );
      byProduct[product.id] = reorderStatus(product.stock, rhythms);
    }
    return byProduct;
  }, [products, schedules]);
}
