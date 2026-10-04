export interface ProductOverviewStock {
  text: string;
  isLow: boolean;
}

export interface ProductOverviewEntry {
  id: string;
  title: string;
  category: string;
  rhythm: string[];
  stock: ProductOverviewStock;
}

export interface ProductOverview {
  products: ProductOverviewEntry[];
}
