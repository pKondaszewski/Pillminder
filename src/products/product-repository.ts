import {
  and,
  eq,
  getTableColumns,
  inArray,
  isNotNull,
  notInArray,
  sql,
} from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { productImages, products } from '@/config/db/schema';

import {
  BUILT_IN_CATEGORIES,
  builtInForName,
  normalizeCategory,
} from './category';
import type { NewProductInput } from './dto/new-product-input';

type ProductRow = typeof products.$inferSelect;
export type Product = Awaited<ReturnType<typeof productsQuery>>[number];
export type ProductStatus = Product['status'];

export function productsQuery() {
  return db
    .select({
      ...getTableColumns(products),
      profileImageFileName: productImages.fileName,
    })
    .from(products)
    .leftJoin(productImages, eq(products.profileImageId, productImages.id));
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const [product] = await productsQuery().where(eq(products.id, id));
  return product;
}

export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  return productsQuery().where(inArray(products.id, ids));
}

export async function getCustomCategories(): Promise<string[]> {
  const rows = await db
    .selectDistinct({ category: products.category })
    .from(products)
    .where(notInArray(products.category, BUILT_IN_CATEGORIES))
    .orderBy(products.category);
  return rows.map((row) => row.category);
}

export async function getProductIdsByCategory(
  category: string,
): Promise<string[]> {
  const rows = await db
    .select({ id: products.id })
    .from(products)
    .where(eq(products.category, category));
  return rows.map((row) => row.id);
}

export async function renameCategoryRows(
  from: string,
  to: string,
): Promise<void> {
  await db
    .update(products)
    .set({ category: to, updatedAt: new Date() })
    .where(eq(products.category, from));
}

export function mergeBuiltInDuplicateCategoryRows(): number {
  // Synchronous on purpose: see the Transactions rule in CLAUDE.md.
  return db.transaction((tx) => {
    const custom = tx
      .selectDistinct({ category: products.category })
      .from(products)
      .where(notInArray(products.category, BUILT_IN_CATEGORIES))
      .all();
    const duplicates = custom.flatMap(({ category }) => {
      const builtIn = builtInForName(category);
      return builtIn ? [{ category, builtIn }] : [];
    });
    duplicates.forEach(({ category, builtIn }) =>
      tx
        .update(products)
        .set({ category: builtIn, updatedAt: new Date() })
        .where(eq(products.category, category))
        .run(),
    );
    return duplicates.length;
  });
}

export async function createProductRow(
  input: NewProductInput,
): Promise<ProductRow> {
  const category = await resolveCategory(input.category);
  const now = new Date();
  const [created] = await db
    .insert(products)
    .values({
      id: Crypto.randomUUID(),
      ...productFields(input, category),
      status: 'active',
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
): Promise<ProductRow> {
  const category = await resolveCategory(input.category);
  const [updated] = await db
    .update(products)
    .set({
      ...productFields(input, category),
      updatedAt: new Date(),
    })
    .where(eq(products.id, id))
    .returning();
  return updated;
}

export async function setStockRow(
  id: string,
  stock: number | null,
): Promise<void> {
  await db
    .update(products)
    .set({ stock, updatedAt: new Date() })
    .where(eq(products.id, id));
}

export async function addPackToStockRow(id: string): Promise<void> {
  await db
    .update(products)
    .set({
      stock: sql`${products.stock} + ${products.packSize}`,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(products.id, id),
        isNotNull(products.stock),
        isNotNull(products.packSize),
      ),
    );
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

function productFields(input: NewProductInput, category: string) {
  return {
    name: input.name,
    category,
    strength: input.strength ?? null,
    unit: input.unit ?? null,
    price: input.price ?? null,
    storeLink: input.storeLink ?? null,
    storeLinkTarget: input.storeLinkTarget ?? null,
    stock: input.stock ?? null,
    packSize: input.packSize ?? null,
    reorderThreshold: input.reorderThreshold ?? null,
    fasting: input.fasting ?? false,
  };
}
