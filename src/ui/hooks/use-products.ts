import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { addProduct, getProductsQuery } from '@/products/product-service';

export function useProducts() {
  const { data } = useLiveQuery(getProductsQuery());
  return { products: data, addProduct };
}
