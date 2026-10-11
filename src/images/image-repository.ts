import { desc, eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { productImages } from '@/config/db/schema';

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
  await db.insert(productImages).values({
    id: Crypto.randomUUID(),
    productId,
    fileName,
    role,
    createdAt: new Date(),
  });
}

export async function deleteImageRow(id: string): Promise<void> {
  await db.delete(productImages).where(eq(productImages.id, id));
}
