import { createLogger } from '@/config/logger';

import type { NewProductInput } from './dto/new-product-input';
import {
  addPackToStockRow,
  createProductRow,
  deleteProductRow,
  getCustomCategories,
  getProductById,
  getProductsByIds,
  type Product,
  productsQuery,
  type ProductStatus,
  setProductStatusRow,
  setStockRow,
  updateProductRow,
} from './product-repository';

export type {
  ProductFormField,
  ProductFormValues,
  TextProductField,
} from './dto/product-form-values';
export type {
  ProductListFilters,
  ProductStatusFilter,
} from './dto/product-list-filters';
export { PRODUCT_UNITS, type ProductUnit } from './dto/product-unit';
export type { RangeDraft } from './dto/range-draft';
export type { StockSummary } from './dto/stock-summary';
export type { TravelPlanEntry } from './dto/travel-plan-output';
export type { Product, ProductStatus } from './product-repository';

const log = createLogger('product-service');

export function getProductsQuery() {
  return productsQuery();
}

export function getProduct(id: string): Promise<Product | undefined> {
  return getProductById(id);
}

export function getProducts(ids: string[]): Promise<Product[]> {
  return getProductsByIds(ids);
}

export function listCustomCategories(): Promise<string[]> {
  return getCustomCategories();
}

export async function addProduct(input: NewProductInput): Promise<string> {
  log.info(`Adding product "${input.name}"`);
  try {
    const created = await createProductRow(input);
    log.info(`Created product ${JSON.stringify(created)}`);
    return created.id;
  } catch (err) {
    log.error(`Failed to add product "${input.name}"`, err);
    throw err;
  }
}

export async function updateProduct(
  id: string,
  input: NewProductInput,
): Promise<void> {
  log.info(`Updating product with id ${id}`);
  try {
    const updated = await updateProductRow(id, input);
    log.info(`Updated product ${JSON.stringify(updated)}`);
  } catch (err) {
    log.error(`Failed to update product with id ${id}`, err);
    throw err;
  }
}

export async function addPackToStock(id: string): Promise<void> {
  log.info(`Adding a pack to the stock of product ${id}`);
  try {
    await addPackToStockRow(id);
  } catch (err) {
    log.error(`Failed to add a pack to the stock of product ${id}`, err);
    throw err;
  }
}

export async function setStock(
  id: string,
  stock: number | null,
): Promise<void> {
  log.info(`Setting stock of product ${id} to ${stock}`);
  try {
    await setStockRow(id, stock);
  } catch (err) {
    log.error(`Failed to set stock of product ${id}`, err);
    throw err;
  }
}

export async function setProductStatus(
  id: string,
  status: ProductStatus,
): Promise<void> {
  log.info(`Setting product ${id} status to ${status}`);
  try {
    await setProductStatusRow(id, status);
  } catch (err) {
    log.error(`Failed to set status for product ${id}`, err);
    throw err;
  }
}

export async function deleteProduct(id: string): Promise<void> {
  log.info(`Deleting product with id ${id}`);
  try {
    await deleteProductRow(id);
  } catch (err) {
    log.error(`Failed to delete product with id ${id}`, err);
    throw err;
  }
}
