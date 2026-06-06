export type Category = 'medication' | 'supplement' | 'care' | 'custom';

export type ProductStatus = 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  dose: string | null;
  notes: string | null;
  category: Category;
  customCategory: string | null;
  price: number | null;
  storeLink: string | null;
  status: ProductStatus;
  stock: number | null;
  reorderThreshold: number | null;
  lastUsedAt: string | null;
  completionNote: string | null;
  createdAt: string;
  updatedAt: string;
}

export type RhythmType = 'daily' | 'everyXDays';

export interface Schedule {
  id: string;
  productId: string;
  type: RhythmType;
  intervalDays: number;
  timesOfDay: string[];
  startDate: string;
  endDate: string | null;
}

export type DoseState = 'pending' | 'taken' | 'skipped';

export interface Dose {
  id: string;
  productId: string;
  scheduleId: string;
  plannedAt: string;
  state: DoseState;
  takenAt: string | null;
}
