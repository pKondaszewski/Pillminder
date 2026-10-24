import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  archiveProduct,
  editProduct,
  removeProduct,
  restockPack,
  restoreProduct,
  undoArchiveProduct,
} from '@/products/product-orchestrator';
import {
  addProduct,
  getProductsQuery,
  shiftStock,
} from '@/products/product-service';

export function useProducts() {
  const { data, updatedAt } = useLiveQuery(getProductsQuery());

  return {
    products: data,
    loaded: updatedAt !== undefined,
    addProduct,
    editProduct,
    removeProduct,
    archiveProduct,
    restoreProduct,
    undoArchiveProduct,
    restockPack,
    shiftStock,
  };
}
