import { and, eq, gte } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { doses } from '@/config/db/schema';

export type Dose = typeof doses.$inferSelect;

export interface NewDoseSlot {
  productId: string;
  scheduleId: string;
  plannedAt: Date;
}

export function dosesQuery() {
  return db.select().from(doses);
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
