import { eq, getTableColumns } from 'drizzle-orm';
import * as Crypto from 'expo-crypto';

import { db } from '@/config/db/database';
import { productImages, products, schedules } from '@/config/db/schema';

import type { CycleState } from './dto/cycle-state';
import type { NewScheduleInput } from './dto/new-schedule-input';

export type Schedule = typeof schedules.$inferSelect;
export type ScheduleListItem = Awaited<
  ReturnType<typeof scheduleListQuery>
>[number];

export function schedulesQuery() {
  return db.select().from(schedules);
}

export function scheduleListQuery() {
  return db
    .select({
      ...getTableColumns(schedules),
      productName: products.name,
      productStrength: products.strength,
      productCategory: products.category,
      productUnit: products.unit,
      productStatus: products.status,
      profileImageFileName: productImages.fileName,
    })
    .from(schedules)
    .innerJoin(products, eq(schedules.productId, products.id))
    .leftJoin(productImages, eq(products.profileImageId, productImages.id));
}

export async function getAllSchedules(): Promise<Schedule[]> {
  return db.select().from(schedules);
}

export async function getScheduleById(
  id: string,
): Promise<Schedule | undefined> {
  const [schedule] = await db
    .select()
    .from(schedules)
    .where(eq(schedules.id, id));
  return schedule;
}

export async function getSchedulesByProductId(
  productId: string,
): Promise<Schedule[]> {
  return db.select().from(schedules).where(eq(schedules.productId, productId));
}

export async function createScheduleRow(
  input: NewScheduleInput,
  cycleState: CycleState,
): Promise<Schedule> {
  const [created] = await db
    .insert(schedules)
    .values({
      id: Crypto.randomUUID(),
      ...scheduleFields(input, cycleState),
    })
    .returning();
  return created;
}

export async function updateScheduleRow(
  id: string,
  input: NewScheduleInput,
  cycleState: CycleState,
): Promise<Schedule> {
  const [updated] = await db
    .update(schedules)
    .set(scheduleFields(input, cycleState))
    .where(eq(schedules.id, id))
    .returning();
  return updated;
}

export async function setSchedulePauseRow(
  id: string,
  pause: {
    pausedAt: Date | null;
    resumeAt: Date | null;
    cyclePausedDays: number;
  },
): Promise<Schedule> {
  const [updated] = await db
    .update(schedules)
    .set(pause)
    .where(eq(schedules.id, id))
    .returning();
  return updated;
}

export async function deleteScheduleRow(id: string): Promise<void> {
  await db.delete(schedules).where(eq(schedules.id, id));
}

function scheduleFields(input: NewScheduleInput, cycleState: CycleState) {
  return {
    productId: input.productId,
    intervalDays: input.intervalDays,
    weekdays: input.weekdays ?? null,
    cycle: input.cycle ?? null,
    ...cycleState,
    timesOfDay: input.timesOfDay,
    quantity: input.quantity ?? 1,
    startDate: input.startDate ?? null,
    endDate: input.endDate ?? null,
  };
}
