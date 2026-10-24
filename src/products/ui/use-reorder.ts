import { useMemo } from 'react';

import { useNow } from '@/commons/ui/use-now';
import { startOfDay } from '@/config/date-utils';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import type { Product } from '@/products/product-service';
import { productReorderStatus } from '@/products/reorder';
import type { Schedule } from '@/schedules/schedule-service';
import { useSchedules } from '@/schedules/ui/use-schedules';

import { useProducts } from './use-products';

export function useReorderStatuses(): Record<string, ReorderStatus> {
  const { products } = useProducts();
  const { schedules } = useSchedules();

  const today = startOfDay(useNow()).getTime();

  return useMemo(
    () => buildReorderStatuses(products, schedules, new Date(today)),
    [products, schedules, today],
  );
}

function buildReorderStatuses(
  products: Product[],
  schedules: Schedule[],
  now: Date,
): Record<string, ReorderStatus> {
  const byProduct: Record<string, ReorderStatus> = {};
  for (const product of products.filter(isActive)) {
    const productSchedules = schedulesFor(product.id, schedules);
    byProduct[product.id] = productReorderStatus(
      product,
      productSchedules,
      now,
    );
  }
  return byProduct;
}

function isActive(product: Product): boolean {
  return product.status !== 'archived';
}

function schedulesFor(productId: string, schedules: Schedule[]): Schedule[] {
  return schedules.filter((schedule) => schedule.productId === productId);
}
