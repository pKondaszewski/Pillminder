import type { ReorderStatus } from '@/products/dto/reorder-status';
import type { Product } from '@/products/product-service';
import { reorderStatus } from '@/products/reorder';
import type { Schedule } from '@/schedules/schedule-service';

import { useProducts } from './use-products';
import { useSchedules } from './use-schedules';

export function useReorderStatuses(): Record<string, ReorderStatus> {
  const { products } = useProducts();
  const { schedules } = useSchedules();

  return buildReorderStatuses(products, schedules, new Date());
}

function buildReorderStatuses(
  products: Product[],
  schedules: Schedule[],
  now: Date,
): Record<string, ReorderStatus> {
  const byProduct: Record<string, ReorderStatus> = {};
  for (const product of products.filter(isActive)) {
    const productSchedules = schedulesFor(product.id, schedules);
    byProduct[product.id] = reorderStatus(product.stock, productSchedules, now);
  }
  return byProduct;
}

function isActive(product: Product): boolean {
  return product.status !== 'archived';
}

function schedulesFor(productId: string, schedules: Schedule[]): Schedule[] {
  return schedules.filter((schedule) => schedule.productId === productId);
}
