export type ProductCategory = 'medication' | 'supplement' | 'care';

export interface NewProductInput {
  name: string;
  category: ProductCategory;
  strength?: string | null;
  price?: number | null;
  storeLink?: string | null;
  stock?: number | null;
}
