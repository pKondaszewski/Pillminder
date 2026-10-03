import type { BackupRows } from './backup-data';

export type BackupErrorCode =
  | 'notJson'
  | 'notBackup'
  | 'newerVersion'
  | 'invalidRow'
  | 'duplicateId'
  | 'duplicateSlot'
  | 'brokenReference';

export interface BackupError {
  code: BackupErrorCode;
  detail?: string;
}

export type BackupParseResult =
  | { ok: true; rows: BackupRows }
  | { ok: false; error: BackupError };
