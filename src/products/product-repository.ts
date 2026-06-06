import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { products } from '@/config/db/schema';

type Category = (typeof products.$inferInsert)['category'];

export interface NewProductInput {
  name: string;
  category: Category;
  price?: number | null;
  storeLink?: string | null;
  stock?: number | null;
}

export async function createProduct(input: NewProductInput): Promise<void> {
  const now = new Date();
  await db.insert(products).values({
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
  });
}
