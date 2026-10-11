import { productLabel } from '@/products/product-label';

import type { TodayDose, TodayDoseRow } from './dto/today-dose-output';

export function toTodayDose(row: TodayDoseRow): TodayDose {
  return {
    id: row.id,
    productId: row.productId,
    productName: productLabel(row.productName, row.productStrength),
    quantity: row.quantity,
    unit: row.unit,
    plannedAt: row.plannedAt,
    state: row.state,
    takenAt: row.takenAt,
    snoozedUntil: row.snoozedUntil,
  };
}
