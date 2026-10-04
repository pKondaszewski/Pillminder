import { and, desc, eq, gte, inArray, lt, ne, or } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { doses, products, schedules } from '@/config/db/schema';

import { type DoseState, planDoseTransition } from './dose-transition';
import type { ReplaceDosesQueryResult } from './dto/replace-doses-query-result';

export type Dose = typeof doses.$inferSelect;

export interface NewDoseSlot {
  productId: string;
  scheduleId: string;
  plannedAt: Date;
}

export function todaysDosesQuery() {
  const start = new Date();
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 1);

  return db
    .select()
    .from(doses)
    .where(and(gte(doses.plannedAt, start), lt(doses.plannedAt, end)))
    .orderBy(doses.plannedAt);
}

export function productHistoryQuery(productId: string, limit = 30) {
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
    .limit(limit);
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

export async function setDoseState(
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

    if (transition.stockDelta === 0) return;

    const product = tx
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, dose.productId))
      .get();
    if (!product || product.stock == null) return;

    tx.update(products)
      .set({
        stock: Math.max(0, product.stock + transition.stockDelta),
        updatedAt: new Date(),
      })
      .where(eq(products.id, dose.productId))
      .run();
  });
}

export async function setDoseSnoozedUntil(
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

export async function deleteFuturePendingDosesForSchedules(
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

export async function replaceFuturePendingDoses(
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
