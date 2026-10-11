import type { Product, ProductStatus } from './product-service';

export const PRODUCT_SEARCH_THRESHOLD = 8;

export type ProductListFilters = {
  query: string;
  category: string | null;
  status: ProductStatus | null;
};

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

export function sortProductsByStatusThenName(
  products: Product[],
  locale: string,
): Product[] {
  return sortProductsByName(products, locale).sort(
    (a, b) => statusRank(a.status) - statusRank(b.status),
  );
}

export function filterProducts(
  products: Product[],
  { query, category, status }: ProductListFilters,
): Product[] {
  return filterProductsByName(products, query).filter(
    (p) =>
      (category === null || p.category === category) &&
      (status === null || p.status === status),
  );
}

export function listedCategories(products: Product[]): string[] {
  return [...new Set(products.map((p) => p.category))];
}

export function categoryFilterIfListed(
  category: string | null,
  listed: string[],
): string | null {
  return category !== null && listed.includes(category) ? category : null;
}

function statusRank(status: ProductStatus): number {
  return status === 'archived' ? 1 : 0;
}
