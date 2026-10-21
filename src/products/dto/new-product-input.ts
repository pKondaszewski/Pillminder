import type { ProductUnit } from './product-unit';

export type BuiltInCategory =
  | 'medication'
  | 'supplement'
  | 'care'
  | 'nasal-spray'
  | 'eye-drops';

export interface NewProductInput {
  name: string;
  category: string;
  strength?: string | null;
  unit?: ProductUnit | null;
  price?: string | null;
  storeLink?: string | null;
  stock?: number | null;
  packSize?: number | null;
  reorderThreshold?: number | null;
  fasting?: boolean;
}
