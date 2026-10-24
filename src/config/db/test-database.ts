import { randomUUID } from 'node:crypto';
import path from 'node:path';

import BetterSqlite3 from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

import * as schema from '@/config/db/schema';

const client = new BetterSqlite3(':memory:');
client.pragma('foreign_keys = ON');

export const db = drizzle(client, { schema });

migrate(db, { migrationsFolder: path.join(__dirname, '../../../drizzle') });

// Stands in for expo-crypto, which has no native module in Jest.
export const testCrypto = { randomUUID };

export function clearTestDatabase(): void {
  const tables = client
    .prepare(
      "SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name != '__drizzle_migrations'",
    )
    .all() as { name: string }[];
  client.pragma('foreign_keys = OFF');
  tables.forEach(({ name }) => client.exec(`DELETE FROM "${name}"`));
  client.pragma('foreign_keys = ON');
}

type ProductValues = typeof schema.products.$inferInsert;
type ScheduleValues = typeof schema.schedules.$inferInsert;
type DoseValues = typeof schema.doses.$inferInsert;
type IntakeValues = typeof schema.asNeededIntakes.$inferInsert;
type ImageValues = typeof schema.productImages.$inferInsert;

const SEED_TIME = new Date('2026-01-01T00:00:00Z');

export function insertProduct(
  values: Partial<ProductValues> & Pick<ProductValues, 'id'>,
) {
  return db
    .insert(schema.products)
    .values({
      name: 'Product',
      category: 'medication',
      createdAt: SEED_TIME,
      updatedAt: SEED_TIME,
      ...values,
    })
    .returning()
    .get();
}

export function insertSchedule(
  values: Partial<ScheduleValues> & Pick<ScheduleValues, 'id' | 'productId'>,
) {
  return db
    .insert(schema.schedules)
    .values({ intervalDays: 1, timesOfDay: ['08:00'], ...values })
    .returning()
    .get();
}

export function insertDose(
  values: Pick<DoseValues, 'id' | 'productId' | 'scheduleId' | 'plannedAt'> &
    Partial<DoseValues>,
) {
  return db.insert(schema.doses).values(values).returning().get();
}

export function insertIntake(
  values: Partial<IntakeValues> &
    Pick<IntakeValues, 'id' | 'productId' | 'takenAt'>,
) {
  return db.insert(schema.asNeededIntakes).values(values).returning().get();
}

export function insertImage(
  values: Partial<ImageValues> &
    Pick<ImageValues, 'id' | 'productId' | 'fileName'>,
) {
  return db
    .insert(schema.productImages)
    .values({ role: 'box', createdAt: SEED_TIME, ...values })
    .returning()
    .get();
}
