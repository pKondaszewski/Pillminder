import { and, desc, eq, gte, lt, max } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import {
  asNeededIntakes,
  doses,
  productImages,
  products,
} from '@/config/db/schema';

import type { IntakeEdit } from './dto/intake-output';
import { adjustedStock } from './intake-stock';

export type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

export function intakesBetweenQuery(from: Date, to: Date) {
  return intakesQuery().where(
    and(gte(asNeededIntakes.takenAt, from), lt(asNeededIntakes.takenAt, to)),
  );
}

export function productIntakesQuery(productId: string) {
  return intakesQuery().where(eq(asNeededIntakes.productId, productId));
}

export function insertIntakeRow(
  productId: string,
  takenAt: Date,
  quantity: number,
): string {
  const id = Crypto.randomUUID();
  db.transaction((tx) => {
    tx.insert(asNeededIntakes)
      .values({ id, productId, takenAt, quantity })
      .run();
    shiftStock(tx, productId, -quantity);
    refreshLastUsedAt(tx, productId);
  });
  return id;
}

export function updateIntakeRow(id: string, edit: IntakeEdit): void {
  db.transaction((tx) => {
    const intake = tx
      .select()
      .from(asNeededIntakes)
      .where(eq(asNeededIntakes.id, id))
      .get();
    if (!intake) return;

    tx.update(asNeededIntakes)
      .set({ quantity: edit.quantity, takenAt: edit.takenAt })
      .where(eq(asNeededIntakes.id, id))
      .run();
    shiftStock(tx, intake.productId, intake.quantity - edit.quantity);
    refreshLastUsedAt(tx, intake.productId);
  });
}

export function deleteIntakeRow(id: string): void {
  db.transaction((tx) => {
    const intake = tx
      .select()
      .from(asNeededIntakes)
      .where(eq(asNeededIntakes.id, id))
      .get();
    if (!intake) return;

    tx.delete(asNeededIntakes).where(eq(asNeededIntakes.id, id)).run();
    shiftStock(tx, intake.productId, intake.quantity);
    refreshLastUsedAt(tx, intake.productId);
  });
}

export function latestUseAt(tx: Transaction, productId: string): Date | null {
  const lastDose = tx
    .select({ takenAt: max(doses.takenAt) })
    .from(doses)
    .where(and(eq(doses.productId, productId), eq(doses.state, 'taken')))
    .get()?.takenAt;
  const lastIntake = tx
    .select({ takenAt: max(asNeededIntakes.takenAt) })
    .from(asNeededIntakes)
    .where(eq(asNeededIntakes.productId, productId))
    .get()?.takenAt;
  return (
    [lastDose, lastIntake]
      .filter((date): date is Date => date != null)
      .sort((a, b) => b.getTime() - a.getTime())[0] ?? null
  );
}

function intakesQuery() {
  return db
    .select({
      id: asNeededIntakes.id,
      productId: asNeededIntakes.productId,
      takenAt: asNeededIntakes.takenAt,
      quantity: asNeededIntakes.quantity,
      productName: products.name,
      category: products.category,
      unit: products.unit,
      profileImageFileName: productImages.fileName,
    })
    .from(asNeededIntakes)
    .innerJoin(products, eq(asNeededIntakes.productId, products.id))
    .leftJoin(productImages, eq(products.profileImageId, productImages.id))
    .orderBy(desc(asNeededIntakes.takenAt));
}

function shiftStock(tx: Transaction, productId: string, delta: number): void {
  const product = tx
    .select({ stock: products.stock })
    .from(products)
    .where(eq(products.id, productId))
    .get();
  if (!product || product.stock === null) return;

  tx.update(products)
    .set({
      stock: adjustedStock(product.stock, delta),
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .run();
}

function refreshLastUsedAt(tx: Transaction, productId: string): void {
  tx.update(products)
    .set({ lastUsedAt: latestUseAt(tx, productId) })
    .where(eq(products.id, productId))
    .run();
}
