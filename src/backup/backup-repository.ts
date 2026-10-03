import { getTableColumns } from 'drizzle-orm';
import type { SQLiteTable } from 'drizzle-orm/sqlite-core';

import { db } from '@/config/db/database';
import { doses, notes, products, schedules } from '@/config/db/schema';

import type { BackupRow, BackupRows } from './dto/backup-data';

const MAX_BOUND_VARIABLES = 500;

export async function readAllRows(): Promise<BackupRows> {
  const [productRows, scheduleRows, doseRows, noteRows] = await Promise.all([
    db.select().from(products),
    db.select().from(schedules),
    db.select().from(doses),
    db.select().from(notes),
  ]);
  return {
    products: productRows,
    schedules: scheduleRows,
    doses: doseRows,
    notes: noteRows,
  };
}

export function replaceAllRows(rows: BackupRows): void {
  // The expo-sqlite driver is synchronous: it commits as soon as the callback
  // returns, so the body must not await anything or the work escapes the transaction.
  db.transaction((tx) => {
    tx.delete(doses).run();
    tx.delete(notes).run();
    tx.delete(schedules).run();
    tx.delete(products).run();

    insertInChunks(tx, products, rows.products);
    insertInChunks(tx, schedules, rows.schedules);
    insertInChunks(tx, doses, rows.doses);
    insertInChunks(tx, notes, rows.notes);
  });
}

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];

function insertInChunks(
  tx: Transaction,
  table: SQLiteTable,
  rows: BackupRow[],
): void {
  if (rows.length === 0) return;
  const columnCount = Object.keys(getTableColumns(table)).length;
  const chunkSize = Math.max(1, Math.floor(MAX_BOUND_VARIABLES / columnCount));
  for (let i = 0; i < rows.length; i += chunkSize) {
    tx.insert(table)
      .values(rows.slice(i, i + chunkSize))
      .run();
  }
}
