import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { products } from '@/config/db/schema';

import type { NewProductInput } from './dto/new-product-input';

export type Product = typeof products.$inferSelect;

export function productsQuery() {
  return db.select().from(products);
}

export async function createProduct(input: NewProductInput): Promise<Product> {
  const now = new Date();
  const [created] = await db
    .insert(products)
    .values({
      id: Crypto.randomUUID(),
      name: input.name,
      category: input.category,
      price: input.price ?? null,
      storeLink: input.storeLink ?? null,
      status: 'active',
      stock: input.stock ?? null,
      lastUsedAt: null,
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  return created;
}

export async function updateProduct(
  id: string,
  input: NewProductInput,
): Promise<Product> {
  const [updated] = await db
    .update(products)
    .set({
      name: input.name,
      category: input.category,
      price: input.price ?? null,
      storeLink: input.storeLink ?? null,
      stock: input.stock ?? null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  return updated;
}

export async function deleteProduct(id: string): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}
