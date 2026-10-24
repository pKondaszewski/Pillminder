import { and, eq, getTableColumns, gte, inArray, lt } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db, type Transaction } from '@/config/db/database';
import { doses, productImages, products, schedules } from '@/config/db/schema';
import { latestUseAt } from '@/intakes/intake-service';
import { adjustedStock } from '@/intakes/intake-stock';
import { quantityOn } from '@/schedules/step-days';

import { planPendingReplacement } from './dose-replacement';
import {
  type DoseState,
  planDoseTransition,
  restoreStockDelta,
} from './dose-transition';
import type { DoseSnapshot } from './dto/dose-snapshot';
import type { ReplaceDosesQueryResult } from './dto/replace-doses-query-result';

export type Dose = typeof doses.$inferSelect;

export interface NewDoseSlot {
  productId: string;
  scheduleId: string;
  plannedAt: Date;
}

export function dosesBetweenQuery(from: Date, to: Date) {
  return db
    .select({
      id: doses.id,
      productId: doses.productId,
      plannedAt: doses.plannedAt,
      state: doses.state,
      takenAt: doses.takenAt,
      takenQuantity: doses.takenQuantity,
      snoozedUntil: doses.snoozedUntil,
      productName: products.name,
      productStrength: products.strength,
      category: products.category,
      unit: products.unit,
      fasting: products.fasting,
      stock: products.stock,
      profileImageFileName: productImages.fileName,
      schedule: getTableColumns(schedules),
    })
    .from(doses)
    .innerJoin(products, eq(doses.productId, products.id))
    .leftJoin(productImages, eq(products.profileImageId, productImages.id))
    .innerJoin(schedules, eq(doses.scheduleId, schedules.id))
    .where(and(gte(doses.plannedAt, from), lt(doses.plannedAt, to)))
    .orderBy(doses.plannedAt);
}

export function productDosesBetweenQuery(
  productId: string,
  from: Date,
  to: Date,
) {
  return db
    .select({
      productId: doses.productId,
      plannedAt: doses.plannedAt,
      state: doses.state,
    })
    .from(doses)
    .where(
      and(
        eq(doses.productId, productId),
        gte(doses.plannedAt, from),
        lt(doses.plannedAt, to),
      ),
    );
}

export async function setDoseStateRow(
  id: string,
  state: DoseState,
  { backdated = false }: { backdated?: boolean } = {},
): Promise<void> {
  db.transaction((tx) => {
    const dose = tx.select().from(doses).where(eq(doses.id, id)).get();
    if (!dose) return;

    const schedule = tx
      .select()
      .from(schedules)
      .where(eq(schedules.id, dose.scheduleId))
      .get();
    const product = tx
      .select({ stock: products.stock, lastUsedAt: products.lastUsedAt })
      .from(products)
      .where(eq(products.id, dose.productId))
      .get();
    const now = new Date();
    const takenAt = backdated && dose.plannedAt < now ? dose.plannedAt : now;
    const transition = planDoseTransition(
      dose,
      state,
      schedule ? quantityOn(schedule, schedule.quantity, dose.plannedAt) : 1,
      takenAt,
      product?.stock ?? null,
    );
    if (!transition) return;

    tx.update(doses)
      .set({
        state: transition.state,
        takenAt: transition.takenAt,
        takenQuantity: transition.takenQuantity,
        snoozedUntil: null,
      })
      .where(eq(doses.id, id))
      .run();

    syncProductAfterDoseChange(
      tx,
      dose.productId,
      product,
      transition.stockDelta,
    );
  });
}

export async function restoreDoseRow({
  id,
  state,
  takenAt,
  takenQuantity,
}: DoseSnapshot): Promise<void> {
  db.transaction((tx) => {
    const dose = tx.select().from(doses).where(eq(doses.id, id)).get();
    if (!dose) return;

    const product = tx
      .select({ stock: products.stock, lastUsedAt: products.lastUsedAt })
      .from(products)
      .where(eq(products.id, dose.productId))
      .get();

    tx.update(doses)
      .set({ state, takenAt, takenQuantity, snoozedUntil: null })
      .where(eq(doses.id, id))
      .run();

    syncProductAfterDoseChange(
      tx,
      dose.productId,
      product,
      restoreStockDelta(dose, { state, takenQuantity }),
    );
  });
}

export async function setDoseSnoozedUntilRow(
  id: string,
  when: Date,
): Promise<void> {
  await db.update(doses).set({ snoozedUntil: when }).where(eq(doses.id, id));
}

export async function getDoseById(id: string): Promise<Dose | undefined> {
  const [dose] = await db.select().from(doses).where(eq(doses.id, id));
  return dose;
}

export async function getFuturePendingDosesByProduct(
  productId: string,
): Promise<Dose[]> {
  return db
    .select()
    .from(doses)
    .where(
      and(
        eq(doses.productId, productId),
        eq(doses.state, 'pending'),
        gte(doses.plannedAt, new Date()),
      ),
    );
}

export async function deleteFuturePendingDoseRowsForSchedules(
  scheduleIds: string[],
  from: Date,
): Promise<string[]> {
  if (scheduleIds.length === 0) return [];
  return db.transaction((tx) => {
    const futurePending = and(
      inArray(doses.scheduleId, scheduleIds),
      eq(doses.state, 'pending'),
      gte(doses.plannedAt, from),
    );

    const existing = tx
      .select({ id: doses.id })
      .from(doses)
      .where(futurePending)
      .all();
    const removedIds = existing.map((row) => row.id);

    if (removedIds.length > 0) {
      tx.delete(doses).where(inArray(doses.id, removedIds)).run();
    }

    return removedIds;
  });
}

export async function replacePendingDoseRows(
  scheduleId: string,
  from: Date,
  now: Date,
  slots: NewDoseSlot[],
): Promise<ReplaceDosesQueryResult> {
  return db.transaction((tx) => {
    const existing = tx
      .select()
      .from(doses)
      .where(
        and(
          eq(doses.scheduleId, scheduleId),
          eq(doses.state, 'pending'),
          gte(doses.plannedAt, from),
        ),
      )
      .all();

    const { kept, removedIds, newSlots } = planPendingReplacement(
      existing,
      slots,
      now,
    );

    if (removedIds.length > 0) {
      tx.delete(doses).where(inArray(doses.id, removedIds)).run();
    }

    if (newSlots.length === 0) return { removedIds, inserted: [], kept };

    const inserted = tx
      .insert(doses)
      .values(
        newSlots.map((slot) => ({
          id: Crypto.randomUUID(),
          productId: slot.productId,
          scheduleId: slot.scheduleId,
          plannedAt: slot.plannedAt,
          state: 'pending' as const,
          takenAt: null,
        })),
      )
      .onConflictDoNothing()
      .returning()
      .all();

    return { removedIds, inserted, kept };
  });
}

function syncProductAfterDoseChange(
  tx: Transaction,
  productId: string,
  product: { stock: number | null; lastUsedAt: Date | null } | undefined,
  stockDelta: number,
): void {
  if (!product) return;

  const lastUsedAt = latestUseAt(tx, productId);
  const stock =
    product.stock == null ? null : adjustedStock(product.stock, stockDelta);
  const stockChanged = stock !== product.stock;
  const lastUsedChanged =
    (lastUsedAt?.getTime() ?? null) !== (product.lastUsedAt?.getTime() ?? null);
  if (!stockChanged && !lastUsedChanged) return;

  tx.update(products)
    .set({
      lastUsedAt,
      ...(stockChanged ? { stock } : {}),
      updatedAt: new Date(),
    })
    .where(eq(products.id, productId))
    .run();
}
