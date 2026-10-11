import { getTableColumns } from 'drizzle-orm';
import type { SQLiteColumn, SQLiteTable } from 'drizzle-orm/sqlite-core';

import { doses, notes, products, schedules } from '@/config/db/schema';

import {
  BACKUP_TABLES,
  type BackupFile,
  type BackupRow,
  type BackupRows,
  type BackupTable,
} from './dto/backup-data';
import type {
  BackupErrorCode,
  BackupParseResult,
} from './dto/backup-parse-result';

export type { BackupRows } from './dto/backup-data';
export type { BackupError } from './dto/backup-parse-result';
export type { BackupParseResult } from './dto/backup-parse-result';

export const BACKUP_FORMAT_VERSION = 1;

const TABLES: Record<BackupTable, SQLiteTable> = {
  products,
  schedules,
  doses,
  notes,
};

const TIME_OF_DAY = /^([01]?\d|2[0-3]):[0-5]\d$/;

export function serializeBackup(rows: BackupRows, exportedAt: Date): string {
  const file: BackupFile = {
    app: 'pillminder',
    version: BACKUP_FORMAT_VERSION,
    exportedAt: exportedAt.toISOString(),
    products: rows.products.map((row) => rowToJson('products', row)),
    schedules: rows.schedules.map((row) => rowToJson('schedules', row)),
    doses: rows.doses.map((row) => rowToJson('doses', row)),
    notes: rows.notes.map((row) => rowToJson('notes', row)),
  };
  return JSON.stringify(file, null, 2);
}

export function parseBackup(text: string): BackupParseResult {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return fail('notJson');
  }

  if (!isRecord(json) || json.app !== 'pillminder') return fail('notBackup');
  const { version } = json;
  if (!Number.isInteger(version) || (version as number) < 1) {
    return fail('notBackup');
  }
  if (!Array.isArray(json.products)) return fail('notBackup');
  if ((version as number) > BACKUP_FORMAT_VERSION) {
    return fail('newerVersion', `v${String(version)}`);
  }

  const rows = {} as BackupRows;
  for (const table of BACKUP_TABLES) {
    const raw = json[table] ?? [];
    if (!Array.isArray(raw)) return fail('notBackup', table);

    const parsed: BackupRow[] = [];
    for (const [index, rawRow] of raw.entries()) {
      const field = firstInvalidField(table, rawRow);
      if (field) return fail('invalidRow', `${table}[${index}].${field}`);
      parsed.push(jsonToRow(table, rawRow as BackupRow));
    }
    rows[table] = parsed;
  }

  return validateRelations(rows);
}

function fail(code: BackupErrorCode, detail?: string): BackupParseResult {
  return { ok: false, error: { code, detail } };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function columnsOf(table: BackupTable): [string, SQLiteColumn][] {
  return Object.entries(getTableColumns(TABLES[table]));
}

function rowToJson(table: BackupTable, row: BackupRow): BackupRow {
  return Object.fromEntries(
    columnsOf(table).map(([key, column]) => {
      const value = row[key];
      return [
        key,
        column.dataType === 'date' && value instanceof Date
          ? value.toISOString()
          : value,
      ];
    }),
  );
}

// Columns come from the Drizzle schema, so columns added by later migrations
// are exported and imported without touching this file. Fields the file does
// not know about are ignored; absent ones fall back to the column default.
function jsonToRow(table: BackupTable, raw: BackupRow): BackupRow {
  const row: BackupRow = {};
  for (const [key, column] of columnsOf(table)) {
    const value = raw[key];
    if (value === undefined || value === null) {
      if (column.default !== undefined) row[key] = column.default;
      else if (!column.notNull) row[key] = null;
      continue;
    }
    row[key] = column.dataType === 'date' ? toDate(value) : value;
  }
  return row;
}

function firstInvalidField(table: BackupTable, raw: unknown): string | null {
  if (!isRecord(raw)) return '(row)';
  for (const [key, column] of columnsOf(table)) {
    const value = raw[key];
    if (value === undefined || value === null) {
      if (column.notNull && !column.hasDefault) return key;
      continue;
    }
    if (!isValidValue(table, key, column, value)) return key;
  }
  return null;
}

function isValidValue(
  table: BackupTable,
  key: string,
  column: SQLiteColumn,
  value: unknown,
): boolean {
  if (table === 'schedules' && key === 'timesOfDay') {
    return (
      Array.isArray(value) &&
      value.every((time) => typeof time === 'string' && TIME_OF_DAY.test(time))
    );
  }
  if (table === 'products' && key === 'category') {
    return typeof value === 'string' && value.trim() !== '';
  }
  switch (column.dataType) {
    case 'date':
      return toDate(value) !== null;
    case 'number':
      return Number.isInteger(value);
    case 'string':
      return (
        typeof value === 'string' &&
        (!column.enumValues || column.enumValues.includes(value))
      );
    default:
      return true;
  }
}

function toDate(value: unknown): Date | null {
  if (typeof value !== 'string' && typeof value !== 'number') return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function validateRelations(rows: BackupRows): BackupParseResult {
  const ids = {} as Record<BackupTable, Set<unknown>>;
  for (const table of BACKUP_TABLES) {
    ids[table] = new Set(rows[table].map((row) => row.id));
    if (ids[table].size !== rows[table].length) {
      return fail('duplicateId', table);
    }
  }

  const references: [BackupTable, string, BackupTable][] = [
    ['schedules', 'productId', 'products'],
    ['doses', 'productId', 'products'],
    ['doses', 'scheduleId', 'schedules'],
    ['notes', 'productId', 'products'],
  ];
  for (const [table, key, target] of references) {
    const index = rows[table].findIndex((row) => !ids[target].has(row[key]));
    if (index >= 0) return fail('brokenReference', `${table}[${index}].${key}`);
  }

  const scheduleProducts = new Map(
    rows.schedules.map((schedule) => [schedule.id, schedule.productId]),
  );
  const mismatch = rows.doses.findIndex(
    (dose) => scheduleProducts.get(dose.scheduleId) !== dose.productId,
  );
  if (mismatch >= 0)
    return fail('productMismatch', `doses[${mismatch}].productId`);

  const slots = new Set(
    rows.doses.map(
      (dose) =>
        `${String(dose.scheduleId)}@${(dose.plannedAt as Date).getTime()}`,
    ),
  );
  if (slots.size !== rows.doses.length) return fail('duplicateSlot', 'doses');

  return { ok: true, rows };
}
