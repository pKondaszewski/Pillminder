import { createLogger } from '@/config/logger';

import type { NewProductInput } from './dto/new-product-input';
import {
  createProduct,
  deleteProduct,
  productsQuery,
  updateProduct,
} from './product-repository';

const log = createLogger('product-service');

export function getProductsQuery() {
  return productsQuery();
}

export async function addProduct(input: NewProductInput): Promise<void> {
  log.info(`Adding product "${input.name}"`);
  try {
    const created = await createProduct(input);
    log.info(`Created product ${JSON.stringify(created)}`);
  } catch (err) {
    log.error(`Failed to add product "${input.name}"`, err);
    throw err;
  }
}

export async function editProduct(
  id: string,
  input: NewProductInput,
): Promise<void> {
  log.info(`Updating product with id ${id}`);
  try {
    const updated = await updateProduct(id, input);
    log.info(`Updated product ${JSON.stringify(updated)}`);
  } catch (err) {
    log.error(`Failed to update product with id ${id}`, err);
    throw err;
  }
}

export async function removeProduct(id: string): Promise<void> {
  log.info(`Deleting product with id ${id}`);
  try {
    await deleteProduct(id);
  } catch (err) {
    log.error(`Failed to delete product with id ${id}`, err);
    throw err;
  }
}
