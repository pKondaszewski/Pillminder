import { BUILT_IN_CATEGORIES, isBuiltInCategory } from './category';
import type { ProductListFilters } from './dto/product-list-filters';
import type { ReorderStatus } from './dto/reorder-status';
import type { Product, ProductStatus } from './product-service';

export const PRODUCT_SEARCH_THRESHOLD = 8;

export type LowStockProduct = {
  product: Product;
  daysLeft: number | null;
};

export const DEFAULT_PRODUCT_FILTERS: ProductListFilters = {
  query: '',
  category: null,
  status: 'active',
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
      (status === 'all' || p.status === status),
  );
}

export function filterableCategories(products: Product[]): string[] {
  const custom = products
    .map((p) => p.category)
    .filter((category) => !isBuiltInCategory(category));
  return [...BUILT_IN_CATEGORIES, ...new Set(custom)];
}

export function categoryFilterIfListed(
  category: string | null,
  listed: string[],
): string | null {
  return category !== null && listed.includes(category) ? category : null;
}

export function mostUrgentLowStock(
  products: Product[],
  statuses: Record<string, ReorderStatus>,
): LowStockProduct | null {
  const low = products.flatMap((product) => {
    const status = statuses[product.id];
    return status?.isLow ? [{ product, daysLeft: status.daysLeft }] : [];
  });
  return (
    low.sort(
      (a, b) =>
        (a.daysLeft ?? Infinity) - (b.daysLeft ?? Infinity) ||
        a.product.id.localeCompare(b.product.id),
    )[0] ?? null
  );
}

function statusRank(status: ProductStatus): number {
  return status === 'archived' ? 1 : 0;
}
