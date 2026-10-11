import { eq, inArray, notInArray } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { products } from '@/config/db/schema';

import { BUILT_IN_CATEGORIES, normalizeCategory } from './category';
import type { NewProductInput } from './dto/new-product-input';

export type Product = typeof products.$inferSelect;
export type ProductStatus = Product['status'];

export function productsQuery() {
  return db.select().from(products);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const [product] = await db.select().from(products).where(eq(products.id, id));
  return product;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  return db.select().from(products).where(inArray(products.id, ids));
}

export async function getCustomCategories(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(notInArray(products.category, BUILT_IN_CATEGORIES))
    .orderBy(products.category);
  return rows.map((row) => row.category);
}

export async function createProductRow(
  input: NewProductInput,
): Promise<Product> {
  const category = await resolveCategory(input.category);
  const now = new Date();
  const [created] = await db
    .insert(products)
    .values({
      id: Crypto.randomUUID(),
      name: input.name,
      category,
      strength: input.strength ?? null,
      unit: input.unit ?? null,
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

export async function updateProductRow(
  id: string,
  input: NewProductInput,
): Promise<Product> {
  const category = await resolveCategory(input.category);
  const [updated] = await db
    .update(products)
    .set({
      name: input.name,
      category,
      strength: input.strength ?? null,
      unit: input.unit ?? null,
      price: input.price ?? null,
      storeLink: input.storeLink ?? null,
      stock: input.stock ?? null,
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  return updated;
}

export async function setProductStatusRow(
  id: string,
  status: ProductStatus,
): Promise<void> {
  await db
    .update(products)
    .set({ status, updatedAt: new Date() })
    .where(eq(products.id, id));
}

export async function deleteProductRow(id: string): Promise<void> {
  await db.delete(products).where(eq(products.id, id));
}

async function resolveCategory(raw: string): Promise<string> {
  const category = normalizeCategory(raw, await getCustomCategories());
  if (category === null) throw new Error('Product category must not be blank');
  return category;
}
