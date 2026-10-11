import { and, desc, eq, gte, inArray, lt, max, ne, or } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { addDays, startOfDay } from '@/config/date-utils';
import { db } from '@/config/db/database';
import { doses, products, schedules } from '@/config/db/schema';

import { type DoseState, planDoseTransition } from './dose-transition';
import type { ReplaceDosesQueryResult } from './dto/replace-doses-query-result';

export type Dose = typeof doses.$inferSelect;

const HISTORY_LIMIT = 30;

export interface NewDoseSlot {
  productId: string;
  scheduleId: string;
  plannedAt: Date;
}

export function todaysDosesQuery(day: Date) {
  const start = startOfDay(day);
  const end = addDays(start, 1);

  return db
    .select({
      id: doses.id,
      plannedAt: doses.plannedAt,
      state: doses.state,
      takenAt: doses.takenAt,
      snoozedUntil: doses.snoozedUntil,
      productName: products.name,
      productStrength: products.strength,
      unit: products.unit,
      quantity: schedules.quantity,
    })
    .from(doses)
    .innerJoin(products, eq(doses.productId, products.id))
    .innerJoin(schedules, eq(doses.scheduleId, schedules.id))
    .where(and(gte(doses.plannedAt, start), lt(doses.plannedAt, end)))
    .orderBy(doses.plannedAt);
}

export function productHistoryQuery(productId: string) {
  const now = new Date();

  return db
    .select()
    .from(doses)
    .where(
      and(
        eq(doses.productId, productId),
        or(ne(doses.state, 'pending'), lt(doses.plannedAt, now)),
      ),
    )
    .orderBy(desc(doses.plannedAt))
    .limit(HISTORY_LIMIT);
}

export async function getDosesPlannedBetween(
  from: Date,
  to: Date,
): Promise<Dose[]> {
  return db
    .select()
    .from(doses)
    .where(and(gte(doses.plannedAt, from), lt(doses.plannedAt, to)))
    .orderBy(doses.plannedAt);
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
      .select({ quantity: schedules.quantity })
      .from(schedules)
      .where(eq(schedules.id, dose.scheduleId))
      .get();
    const now = new Date();
    const takenAt = backdated && dose.plannedAt < now ? dose.plannedAt : now;
    const transition = planDoseTransition(
      dose,
      state,
      schedule?.quantity ?? 1,
      takenAt,
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

    const product = tx
      .select({ stock: products.stock, lastUsedAt: products.lastUsedAt })
      .from(products)
      .where(eq(products.id, dose.productId))
      .get();
    if (!product) return;

    const lastUsedAt =
      tx
        .select({ takenAt: max(doses.takenAt) })
        .from(doses)
        .where(
          and(eq(doses.productId, dose.productId), eq(doses.state, 'taken')),
        )
        .get()?.takenAt ?? null;
    const stock =
      product.stock == null
        ? null
        : Math.max(0, product.stock + transition.stockDelta);
    const stockChanged = stock !== product.stock;
    const lastUsedChanged =
      (lastUsedAt?.getTime() ?? null) !==
      (product.lastUsedAt?.getTime() ?? null);
    if (!stockChanged && !lastUsedChanged) return;

    tx.update(products)
      .set({
        lastUsedAt,
        ...(stockChanged ? { stock } : {}),
        updatedAt: new Date(),
      })
      .where(eq(products.id, dose.productId))
      .run();
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

export async function replaceFuturePendingDoseRows(
  scheduleId: string,
  from: Date,
  slots: NewDoseSlot[],
): Promise<ReplaceDosesQueryResult> {
  return db.transaction((tx) => {
    const futurePending = and(
      eq(doses.scheduleId, scheduleId),
      eq(doses.state, 'pending'),
      gte(doses.plannedAt, from),
    );

    const existing = tx
      .select({ id: doses.id, plannedAt: doses.plannedAt })
      .from(doses)
      .where(futurePending)
      .all();

    const wanted = new Set(slots.map((slot) => slot.plannedAt.getTime()));
    const existingTimes = new Set(
      existing.map((row) => row.plannedAt.getTime()),
    );

    const removedIds = existing
      .filter((row) => !wanted.has(row.plannedAt.getTime()))
      .map((row) => row.id);

    if (removedIds.length > 0) {
      tx.delete(doses).where(inArray(doses.id, removedIds)).run();
    }

    const newSlots = slots.filter(
      (slot) => !existingTimes.has(slot.plannedAt.getTime()),
    );

    if (newSlots.length === 0) return { removedIds, inserted: [] };

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

    return { removedIds, inserted };
  });
}
