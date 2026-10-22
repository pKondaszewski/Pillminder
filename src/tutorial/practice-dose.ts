import type { TodayDose } from '@/doses/dose-service';
import { productLabel } from '@/products/product-label';
import type { Product } from '@/products/product-service';

export function newestProduct(products: Product[]): Product | undefined {
  return products.reduce<Product | undefined>(
    (newest, product) =>
      !newest || product.createdAt > newest.createdAt ? product : newest,
    undefined,
  );
}

export function practiceDose(product: Product, plannedAt: Date): TodayDose {
  return {
    id: 'practice',
    productId: product.id,
    plannedAt,
    state: 'pending',
    takenAt: null,
    takenQuantity: null,
    snoozedUntil: null,
    productName: productLabel(product.name, product.strength),
    category: product.category,
    unit: product.unit,
    fasting: product.fasting,
    stockTracked: false,
    profileImageFileName: product.profileImageFileName,
    quantity: 1,
  };
}
