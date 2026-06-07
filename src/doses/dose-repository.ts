import { and, eq, gte, lt } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { doses } from '@/config/db/schema';

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

export async function setDoseState(
  id: string,
  state: 'taken' | 'pending',
): Promise<void> {
  await db
    .update(doses)
    .set({ state, takenAt: state === 'taken' ? new Date() : null })
    .where(eq(doses.id, id));
}

export async function replaceFuturePendingDoses(
  scheduleId: string,
  from: Date,
  slots: NewDoseSlot[],
): Promise<void> {
  await db.transaction(async (tx) => {
    await tx
      .delete(doses)
      .where(
        and(
          eq(doses.scheduleId, scheduleId),
          eq(doses.state, 'pending'),
          gte(doses.plannedAt, from),
        ),
      );

    if (slots.length === 0) return;

    await tx
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
      .onConflictDoNothing();
  });
}
