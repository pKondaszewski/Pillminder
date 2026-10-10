import { productLabel } from '@/products/product-label';
import type { ProductUnit } from '@/products/product-unit';

import type { DoseState } from '../dose-transition';

export interface TodayDose {
  id: string;
  productName: string;
  quantity: number;
  unit: ProductUnit | null;
  plannedAt: Date;
  state: DoseState;
  takenAt: Date | null;
  snoozedUntil: Date | null;
}

export interface TodayDoseRow {
  id: string;
  plannedAt: Date;
  state: DoseState;
  takenAt: Date | null;
  snoozedUntil: Date | null;
  productName: string;
  productStrength: string | null;
  unit: ProductUnit | null;
  quantity: number;
}

export function toTodayDose(row: TodayDoseRow): TodayDose {
  return {
    id: row.id,
    productName: productLabel(row.productName, row.productStrength),
    quantity: row.quantity,
    unit: row.unit,
    plannedAt: row.plannedAt,
    state: row.state,
    takenAt: row.takenAt,
    snoozedUntil: row.snoozedUntil,
  };
}
