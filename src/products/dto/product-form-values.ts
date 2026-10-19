import type { ProductUnit } from './product-unit';

export type TextProductField =
  | 'name'
  | 'strength'
  | 'price'
  | 'stock'
  | 'packSize'
  | 'storeLink';

export type ValidatedProductField = 'name' | 'price' | 'stock' | 'packSize';

export type ProductFormField = ValidatedProductField | 'category';

export type ProductFormValues = Record<TextProductField, string> & {
  category: string;
  unit: ProductUnit | null;
  fasting: boolean;
};
