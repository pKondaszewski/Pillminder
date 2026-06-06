import { products } from '@/config/db/schema';

type Category = (typeof products.$inferInsert)['category'];

export interface NewProductInput {
  name: string;
  category: Category;
  price?: number | null;
  storeLink?: string | null;
  stock?: number | null;
}
