import type { Translate } from '@/config/translate';

import type { ProductUnit } from './dto/product-unit';

export function formatAmount(count: number, unit: ProductUnit, t: Translate) {
  return t(`unit.${unit}`, { count });
}
