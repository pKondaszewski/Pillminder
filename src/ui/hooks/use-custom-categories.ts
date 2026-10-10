import { useEffect, useState } from 'react';

import { createLogger } from '@/config/logger';
import { listCustomCategories } from '@/products/product-service';

const log = createLogger('use-custom-categories');

export function useCustomCategories(): string[] {
  const [categories, setCategories] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    listCustomCategories()
      .then((loaded) => {
        if (!cancelled) setCategories(loaded);
      })
      .catch((err) => log.error('Failed to load custom categories', err));
    return () => {
      cancelled = true;
    };
  }, []);

  return categories;
}
