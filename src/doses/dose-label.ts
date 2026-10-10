import { formatAmount, type ProductUnit } from '@/products/product-unit';
import type { Translate } from '@/schedules/schedule-rhythm';

export function doseQuantityText(
  quantity: number,
  unit: ProductUnit | null,
  t: Translate,
): string | null {
  if (unit) return formatAmount(quantity, unit, t);
  return quantity !== 1 ? t('home.quantity', { count: quantity }) : null;
}

export function reminderBody(
  name: string,
  quantity: number,
  unit: ProductUnit | null,
  t: Translate,
): string {
  if (unit) {
    return t('notification.bodyAmount', {
      name,
      amount: formatAmount(quantity, unit, t),
    });
  }
  return quantity > 1
    ? t('notification.bodyQuantity', { name, quantity })
    : t('notification.body', { name });
}
