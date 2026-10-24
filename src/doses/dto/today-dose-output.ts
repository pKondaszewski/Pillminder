import type { ProductUnit } from '@/products/product-service';
import type { Schedule } from '@/schedules/schedule-service';

import type { DoseState } from '../dose-transition';

export interface TodayDoseRow {
  id: string;
  productId: string;
  plannedAt: Date;
  state: DoseState;
  takenAt: Date | null;
  takenQuantity: number | null;
  snoozedUntil: Date | null;
  productName: string;
  productStrength: string | null;
  category: string;
  unit: ProductUnit | null;
  fasting: boolean;
  stock: number | null;
  profileImageFileName: string | null;
  schedule: Schedule;
}

export interface TodayDose {
  id: string;
  productId: string;
  plannedAt: Date;
  state: DoseState;
  takenAt: Date | null;
  takenQuantity: number | null;
  snoozedUntil: Date | null;
  productName: string;
  category: string;
  unit: ProductUnit | null;
  fasting: boolean;
  stockTracked: boolean;
  profileImageFileName: string | null;
  quantity: number;
}
