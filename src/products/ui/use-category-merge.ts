import { useEffect } from 'react';

import { mergeBuiltInDuplicateCategories } from '@/products/product-service';

export function useCategoryMerge() {
  useEffect(() => {
    mergeBuiltInDuplicateCategories();
  }, []);
}
