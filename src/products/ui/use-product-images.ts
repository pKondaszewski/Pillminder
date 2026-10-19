import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { getImagesQuery } from '@/images/image-service';

export function useProductImages(productId: string) {
  const { data } = useLiveQuery(getImagesQuery(productId), [productId]);
  return { images: data };
}
