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
