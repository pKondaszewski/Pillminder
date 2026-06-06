import type { SQLiteDatabase } from 'expo-sqlite';

import { migrations } from './migrations';

export const DATABASE_NAME = 'pillpal.db';

async function migrate(db: SQLiteDatabase): Promise<void> {
  const row = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version',
  );
  let current = row?.user_version ?? 0;

  const pending = migrations
    .filter((m) => m.version > current)
    .sort((a, b) => a.version - b.version);

  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.up);
    });
    await db.execAsync(`PRAGMA user_version = ${migration.version}`);
    current = migration.version;
  }
}

export async function initDatabase(db: SQLiteDatabase): Promise<void> {
  await db.execAsync('PRAGMA foreign_keys = ON');
  await migrate(db);
}
