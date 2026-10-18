import { productLabel } from '@/products/product-label';

import type { TodayDose, TodayDoseRow } from './dto/today-dose-output';

export function toTodayDose({
  productStrength,
  stock,
  ...row
}: TodayDoseRow): TodayDose {
  return {
    ...row,
    productName: productLabel(row.productName, productStrength),
    stockTracked: stock !== null,
  };
}
