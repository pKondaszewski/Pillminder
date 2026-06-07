import { eq } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { schedules } from '@/config/db/schema';

import type { NewScheduleInput } from './dto/new-schedule-input';

export type Schedule = typeof schedules.$inferSelect;

export function schedulesQuery() {
  return db.select().from(schedules);
}

export async function createSchedule(
  input: NewScheduleInput,
): Promise<Schedule> {
  const [created] = await db
    .insert(schedules)
    .values({
      id: Crypto.randomUUID(),
      productId: input.productId,
      intervalDays: input.intervalDays,
      timesOfDay: input.timesOfDay,
    })
    .returning();
  return created;
}

export async function updateSchedule(
  id: string,
  input: NewScheduleInput,
): Promise<Schedule> {
  const [updated] = await db
    .update(schedules)
    .set({
      productId: input.productId,
      intervalDays: input.intervalDays,
      timesOfDay: input.timesOfDay,
    })
    .where(eq(schedules.id, id))
    .returning();
  return updated;
}

export async function deleteSchedule(id: string): Promise<void> {
  await db.delete(schedules).where(eq(schedules.id, id));
}
