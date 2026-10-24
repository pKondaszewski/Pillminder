import { createLogger } from '@/config/logger';

import { checkCustomCategoryName } from './category';
import type { NewProductInput } from './dto/new-product-input';
import {
  addPackToStockRow,
  createProductRow,
  deleteProductRow,
  getCustomCategories,
  getProductById,
  getProductIdsByCategory,
  getProductsByIds,
  mergeBuiltInDuplicateCategoryRows,
  type Product,
  productsQuery,
  type ProductStatus,
  renameCategoryRows,
  setProductStatusRow,
  shiftStockRow,
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
export {
  STORE_LINK_TARGETS,
  type StoreLinkTarget,
} from './dto/store-link-target';
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

export function listProductIdsByCategory(category: string): Promise<string[]> {
  return getProductIdsByCategory(category);
}

export function mergeBuiltInDuplicateCategories(): void {
  try {
    const merged = mergeBuiltInDuplicateCategoryRows();
    if (merged > 0) {
      log.info(`Merged ${merged} custom categories into built-ins`);
    }
  } catch (err) {
    log.error('Merging duplicate categories failed', err);
  }
}

export async function renameCustomCategory(
  from: string,
  to: string,
): Promise<string> {
  log.info(`Renaming category "${from}" to "${to}"`);
  const check = checkCustomCategoryName(to, from, await getCustomCategories());
  if (check.error) throw new Error(`Category name rejected: ${check.error}`);
  try {
    await renameCategoryRows(from, check.name);
    return check.name;
  } catch (err) {
    log.error(`Failed to rename category "${from}"`, err);
    throw err;
  }
}

export async function addProduct(input: NewProductInput): Promise<string> {
  log.info(`Adding product "${input.name}"`);
  try {
    const created = await createProductRow(input);
    log.info(`Created product ${created.id}`);
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
    log.info(`Updated product ${updated.id}`);
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

export async function shiftStock(id: string, delta: number): Promise<void> {
  log.info(`Shifting stock of product ${id} by ${delta}`);
  try {
    await shiftStockRow(id, delta);
  } catch (err) {
    log.error(`Failed to shift stock of product ${id}`, err);
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
