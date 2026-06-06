import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/config/db/database';
import { products } from '@/config/db/schema';

import { createProduct } from './product-repository';

export function useProducts() {
  const { data } = useLiveQuery(db.select().from(products));
  return { products: data, addProduct: createProduct };
}
