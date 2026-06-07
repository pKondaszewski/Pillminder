export type ProductCategory = 'medication' | 'supplement' | 'care';

export interface NewProductInput {
  name: string;
  category: ProductCategory;
  price?: number | null;
  storeLink?: string | null;
  stock?: number | null;
}
