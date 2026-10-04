export type BuiltInCategory = 'medication' | 'supplement' | 'care';

export interface NewProductInput {
  name: string;
  category: string;
  strength?: string | null;
  price?: number | null;
  storeLink?: string | null;
  stock?: number | null;
}
