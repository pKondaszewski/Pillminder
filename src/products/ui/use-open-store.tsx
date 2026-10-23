import { useState } from 'react';
import { Linking } from 'react-native';

import { createLogger } from '@/config/logger';
import { editedProductInput } from '@/products/product-form';
import type { Product, StoreLinkTarget } from '@/products/product-service';
import { mustAskStoreTarget, resolveStoreUrl } from '@/products/store-link';
import { StoreTargetSheet } from '@/products/ui/store-target-sheet';
import { useProducts } from '@/products/ui/use-products';

const log = createLogger('open-store');

export function useOpenStore() {
  const { editProduct } = useProducts();
  const [asking, setAsking] = useState<Product | null>(null);

  const openStore = (product: Product) => {
    if (mustAskStoreTarget(product.storeLink, product.storeLinkTarget)) {
      setAsking(product);
      return;
    }
    open(product, product.storeLinkTarget);
  };

  const choose = (target: StoreLinkTarget, remember: boolean) => {
    if (!asking) return;
    setAsking(null);
    open(asking, target);
    if (remember) {
      editProduct(
        asking.id,
        editedProductInput(asking, { storeLinkTarget: target }),
      ).catch((err) => log.error('Failed to remember the store target', err));
    }
  };

  const storeTargetSheet = asking ? (
    <StoreTargetSheet onChoose={choose} onClose={() => setAsking(null)} />
  ) : null;

  return { openStore, storeTargetSheet };
}

function open(product: Product, target: StoreLinkTarget | null): void {
  const url = resolveStoreUrl(product.storeLink, target);
  if (!url) return;
  Linking.openURL(url).catch((err) =>
    log.error('Failed to open the store', err),
  );
}
