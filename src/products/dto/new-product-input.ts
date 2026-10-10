import type { ProductUnit } from '../product-unit';

export type BuiltInCategory = 'medication' | 'supplement' | 'care';

export interface NewProductInput {
  name: string;
  category: string;
  strength?: string | null;
  unit?: ProductUnit | null;
  price?: number | null;
  storeLink?: string | null;
  stock?: number | null;
}
