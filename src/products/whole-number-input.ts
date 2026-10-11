export type WholeNumberInput =
  | { valid: true; value: number | null }
  | { valid: false };

const DIGITS_ONLY = /^\d+$/;

export function parseWholeNumber(text: string, min: number): WholeNumberInput {
  const trimmed = text.trim();
  if (trimmed === '') return { valid: true, value: null };
  if (!DIGITS_ONLY.test(trimmed)) return { valid: false };
  const parsed = Number(trimmed);
  return Number.isSafeInteger(parsed) && parsed >= min
    ? { valid: true, value: parsed }
    : { valid: false };
}
