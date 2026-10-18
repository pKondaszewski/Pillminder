import { Linking } from 'react-native';

import { createLogger } from '@/config/logger';
import { resolveStoreUrl } from '@/products/store-link';

const log = createLogger('open-store');

export function openStore(storeLink: string | null): void {
  const url = resolveStoreUrl(storeLink);
  if (!url) return;
  Linking.openURL(url).catch((err) =>
    log.error('Failed to open the store', err),
  );
}
