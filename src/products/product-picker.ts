import type { Product } from './product-service';

export const PRODUCT_SEARCH_THRESHOLD = 8;

export function sortProductsByName(
  products: Product[],
  locale: string,
): Product[] {
  return [...products].sort(
    (a, b) => a.name.localeCompare(b.name, locale) || a.id.localeCompare(b.id),
  );
}

export function filterProductsByName(
  products: Product[],
  query: string,
): Product[] {
  const needle = query.trim().toLowerCase();
  return products.filter((p) => p.name.toLowerCase().includes(needle));
}
