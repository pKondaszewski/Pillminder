import type { ProductStatus } from '../product-repository';

export type ProductStatusFilter = ProductStatus | 'all';

export type ProductListFilters = {
  query: string;
  category: string | null;
  status: ProductStatusFilter;
};
