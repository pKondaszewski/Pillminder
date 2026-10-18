import { and, desc, eq, isNull } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { productImages, products } from '@/config/db/schema';

import type { ImageRole } from './image-role';

export type ProductImage = typeof productImages.$inferSelect;

export function imagesByProductQuery(productId: string) {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(desc(productImages.createdAt));
}

export async function getImageFileNamesByProduct(
  productId: string,
): Promise<string[]> {
  const rows = await db
    .select({ fileName: productImages.fileName })
    .from(productImages)
    .where(eq(productImages.productId, productId));
  return rows.map((row) => row.fileName);
}

export async function createImageRow(
  productId: string,
  fileName: string,
  role: ImageRole,
): Promise<void> {
  const id = Crypto.randomUUID();
  db.transaction((tx) => {
    tx.insert(productImages)
      .values({ id, productId, fileName, role, createdAt: new Date() })
      .run();
    tx.update(products)
      .set({ profileImageId: id })
      .where(and(eq(products.id, productId), isNull(products.profileImageId)))
      .run();
  });
}

export async function setProfileImageRow(
  productId: string,
  imageId: string | null,
): Promise<void> {
  await db
    .update(products)
    .set({ profileImageId: imageId })
    .where(eq(products.id, productId));
}

export async function deleteImageRow(id: string): Promise<void> {
  // useLiveQuery only reacts to writes on the queried table, so the profile
  // reference is cleared explicitly instead of through the foreign key action.
  db.transaction((tx) => {
    tx.update(products)
      .set({ profileImageId: null })
      .where(eq(products.profileImageId, id))
      .run();
    tx.delete(productImages).where(eq(productImages.id, id)).run();
  });
}
