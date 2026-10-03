export const BACKUP_TABLES = [
  'products',
  'schedules',
  'doses',
  'notes',
] as const;

export type BackupTable = (typeof BACKUP_TABLES)[number];

export type BackupRow = Record<string, unknown>;

export type BackupRows = Record<BackupTable, BackupRow[]>;

export interface BackupFile extends BackupRows {
  app: 'pillminder';
  version: number;
  exportedAt: string;
}
