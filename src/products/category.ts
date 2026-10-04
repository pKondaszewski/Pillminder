import type { BuiltInCategory } from './dto/new-product-input';

export const BUILT_IN_CATEGORIES: BuiltInCategory[] = [
  'medication',
  'supplement',
  'care',
];

const BUILT_IN_STORE_SUGGESTIONS: Record<BuiltInCategory, string[]> = {
  care: ['rossmann', 'hebe', 'biedronka'],
  medication: ['pharmacy'],
  supplement: ['rossmann', 'hebe', 'pharmacy'],
};

export function isBuiltInCategory(
  category: string,
): category is BuiltInCategory {
  return (BUILT_IN_CATEGORIES as string[]).includes(category);
}

export function supportsStrength(category: string): boolean {
  return category !== 'care';
}

export function storeSuggestionKeys(category: string): string[] {
  return isBuiltInCategory(category)
    ? BUILT_IN_STORE_SUGGESTIONS[category]
    : [];
}

export function normalizeCategory(
  raw: string,
  existingCustomCategories: string[],
): string | null {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (cleaned === '') return null;
  const key = cleaned.toLowerCase();
  const builtIn = BUILT_IN_CATEGORIES.find((c) => c === key);
  if (builtIn) return builtIn;
  return (
    existingCustomCategories.find((c) => c.toLowerCase() === key) ?? cleaned
  );
}
