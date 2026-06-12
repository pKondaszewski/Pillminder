import { and, desc, eq, gte, lt, ne, or } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { doses, products } from '@/config/db/schema';

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

export async function setDoseState(
  id: string,
  state: 'taken' | 'pending',
): Promise<void> {
  await db.transaction(async (tx) => {
    const [dose] = await tx.select().from(doses).where(eq(doses.id, id));
    if (!dose || dose.state === state) return;

    await tx
      .update(doses)
      .set({
        state,
        takenAt: state === 'taken' ? new Date() : null,
        snoozedUntil: null,
      })
      .where(eq(doses.id, id));

    const [product] = await tx
      .select({ stock: products.stock })
      .from(products)
      .where(eq(products.id, dose.productId));
    if (!product || product.stock == null) return;

    const delta = state === 'taken' ? -1 : 1;
    await tx
      .update(products)
      .set({
        stock: Math.max(0, product.stock + delta),
        updatedAt: new Date(),
      })
      .where(eq(products.id, dose.productId));
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

export async function replaceFuturePendingDoses(
  scheduleId: string,
  from: Date,
  slots: NewDoseSlot[],
): Promise<ReplaceDosesQueryResult> {
  return db.transaction(async (tx) => {
    const futurePending = and(
      eq(doses.scheduleId, scheduleId),
      eq(doses.state, 'pending'),
      gte(doses.plannedAt, from),
    );

    const removed = await tx
      .select({ id: doses.id })
      .from(doses)
      .where(futurePending);

    await tx.delete(doses).where(futurePending);

    const removedIds = removed.map((row) => row.id);

    if (slots.length === 0) return { removedIds, inserted: [] };

    const inserted = await tx
      .insert(doses)
      .values(
        slots.map((slot) => ({
          id: Crypto.randomUUID(),
          productId: slot.productId,
          scheduleId: slot.scheduleId,
          plannedAt: slot.plannedAt,
          state: 'pending' as const,
          takenAt: null,
        })),
      )
      .onConflictDoNothing()
      .returning();

    return { removedIds, inserted };
  });
}
