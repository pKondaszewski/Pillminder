import { and, eq, isNull } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { productImages, products } from '@/config/db/schema';

export type ProductImage = typeof productImages.$inferSelect;

export function imagesByProductQuery(productId: string) {
  return db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId));
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

export async function getAllImageFileNames(): Promise<string[]> {
  const rows = await db
    .select({ fileName: productImages.fileName })
    .from(productImages);
  return rows.map((row) => row.fileName);
}

export async function createImageRow(
  productId: string,
  fileName: string,
): Promise<ProductImage> {
  const image: ProductImage = {
    id: Crypto.randomUUID(),
    productId,
    fileName,
    role: 'box',
    createdAt: new Date(),
  };
  db.transaction((tx) => {
    tx.insert(productImages).values(image).run();
    tx.update(products)
      .set({ profileImageId: image.id })
      .where(and(eq(products.id, productId), isNull(products.profileImageId)))
      .run();
  });
  return image;
}

export async function restoreImageRow(
  image: ProductImage,
  asProfile: boolean,
): Promise<void> {
  db.transaction((tx) => {
    tx.insert(productImages).values(image).run();
    if (asProfile) {
      tx.update(products)
        .set({ profileImageId: image.id })
        .where(eq(products.id, image.productId))
        .run();
    }
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

export async function deleteImageRowsByFileNames(
  fileNames: string[],
): Promise<void> {
  db.transaction((tx) => {
    for (const fileName of fileNames) {
      const row = tx
        .select({ id: productImages.id })
        .from(productImages)
        .where(eq(productImages.fileName, fileName))
        .get();
      if (!row) continue;
      tx.update(products)
        .set({ profileImageId: null })
        .where(eq(products.profileImageId, row.id))
        .run();
      tx.delete(productImages).where(eq(productImages.id, row.id)).run();
    }
  });
}
