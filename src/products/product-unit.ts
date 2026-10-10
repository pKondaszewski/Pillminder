import type { Translate } from '@/schedules/schedule-rhythm';

export const PRODUCT_UNITS = ['tablet', 'capsule', 'drop', 'ml'] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];

export function formatAmount(count: number, unit: ProductUnit, t: Translate) {
  return t(`unit.${unit}`, { count });
}
