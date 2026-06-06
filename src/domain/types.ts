export type Category = 'medication' | 'supplement' | 'care';

export type ProductStatus = 'active' | 'archived';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number | null;
  storeLink: string | null;
  status: ProductStatus;
  stock: number | null;
  lastUsedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
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

export interface Note {
  id: string;
  productId: string;
  body: string;
  createdAt: Date;
  updatedAt: Date;
}

export type DoseState = 'pending' | 'taken' | 'skipped';

export interface Dose {
  id: string;
  productId: string;
  scheduleId: string;
  plannedAt: Date;
  state: DoseState;
  takenAt: Date | null;
}
