import { productLabel } from '@/products/product-label';
import { quantityOn } from '@/schedules/step-days';

import type { TodayDose, TodayDoseRow } from './dto/today-dose-output';

export function toTodayDose({
  productStrength,
  stock,
  schedule,
  ...row
}: TodayDoseRow): TodayDose {
  return {
    ...row,
    quantity: quantityOn(schedule, schedule.quantity, row.plannedAt),
    productName: productLabel(row.productName, productStrength),
    stockTracked: stock !== null,
  };
}
