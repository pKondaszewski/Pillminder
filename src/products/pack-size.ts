import { isPositiveInteger } from '@/schedules/schedule-validator';

export type PackSizeInput =
  | { valid: true; packSize: number | null }
  | { valid: false };

export function parsePackSize(text: string): PackSizeInput {
  const trimmed = text.trim();
  if (trimmed === '') return { valid: true, packSize: null };
  const parsed = Number(trimmed);
  return isPositiveInteger(parsed)
    ? { valid: true, packSize: parsed }
    : { valid: false };
}
