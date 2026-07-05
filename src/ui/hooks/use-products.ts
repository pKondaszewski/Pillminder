import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  archiveProduct,
  editProduct,
  removeProduct,
  restoreProduct,
} from '@/products/product-orchestrator';
import { addProduct, getProductsQuery } from '@/products/product-service';

export function useProducts() {
  const { data } = useLiveQuery(getProductsQuery());

  return {
    products: data,
    addProduct,
    editProduct,
    removeProduct,
    archiveProduct,
    restoreProduct,
  };
}
