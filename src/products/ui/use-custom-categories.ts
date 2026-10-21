import { useCallback, useEffect, useState } from 'react';

import { createLogger } from '@/config/logger';
import { listCustomCategories } from '@/products/product-service';

const log = createLogger('use-custom-categories');

export function useCustomCategories() {
  const [categories, setCategories] = useState<string[]>([]);
  const [version, setVersion] = useState(0);

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
  }, [version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);

  return { categories, reload };
}
