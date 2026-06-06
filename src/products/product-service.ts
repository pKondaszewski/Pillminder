import { createLogger } from '@/config/logger';

import type { NewProductInput } from './dto/new-product-input';
import { createProduct, productsQuery } from './product-repository';

const log = createLogger('product-service');

export function getProductsQuery() {
  return productsQuery();
}

export async function addProduct(input: NewProductInput): Promise<void> {
  log.info('add', input.name);
  try {
    await createProduct(input);
  } catch (err) {
    log.error('add failed', err);
    throw err;
  }
}
