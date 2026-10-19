export const PRODUCT_UNITS = ['tablet', 'capsule', 'drop', 'ml'] as const;

export type ProductUnit = (typeof PRODUCT_UNITS)[number];
