import { useMemo } from 'react';

import type {
  products as productsTable,
  schedules as schedulesTable,
} from '@/config/db/schema';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import { reorderStatus } from '@/products/reorder';

import { useProducts } from './use-products';
import { useSchedules } from './use-schedules';

type Product = typeof productsTable.$inferSelect;
type Schedule = typeof schedulesTable.$inferSelect;

export function useReorderStatuses(): Record<string, ReorderStatus> {
  const { products } = useProducts();
  const { schedules } = useSchedules();

  return useMemo(
    () => buildReorderStatuses(products ?? [], schedules ?? []),
    [products, schedules],
  );
}

function buildReorderStatuses(
  products: Product[],
  schedules: Schedule[],
): Record<string, ReorderStatus> {
  const byProduct: Record<string, ReorderStatus> = {};
  for (const product of products.filter(isActive)) {
    const productSchedules = schedulesFor(product.id, schedules);
    byProduct[product.id] = reorderStatus(product.stock, productSchedules);
  }
  return byProduct;
}

function isActive(product: Product): boolean {
  return product.status !== 'archived';
}

function schedulesFor(productId: string, schedules: Schedule[]): Schedule[] {
  return schedules.filter((schedule) => schedule.productId === productId);
}
