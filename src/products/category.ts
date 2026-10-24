import en from '@/config/i18n/locales/en.json';
import pl from '@/config/i18n/locales/pl.json';
import type { Translate } from '@/config/translate';

import type { CategoryNameCheck } from './dto/category-name-check';
import type { BuiltInCategory } from './dto/new-product-input';
import type { ProductUnit } from './dto/product-unit';

export const MAX_CUSTOM_CATEGORY_LENGTH = 30;

export const BUILT_IN_CATEGORIES: BuiltInCategory[] = [
  'medication',
  'supplement',
  'care',
  'nasal-spray',
  'eye-drops',
];

// Labels come from the locale files, so a new built-in or a renamed label
// needs no second list here.
const BUILT_IN_LABELS = new Map<string, BuiltInCategory>(
  BUILT_IN_CATEGORIES.flatMap((category) =>
    [en, pl].map(
      (locale) => [locale.category[category].toLowerCase(), category] as const,
    ),
  ),
);

const BUILT_IN_STORE_SUGGESTIONS: Record<BuiltInCategory, string[]> = {
  care: ['rossmann', 'hebe', 'biedronka'],
  'eye-drops': ['pharmacy'],
  medication: ['pharmacy'],
  'nasal-spray': ['pharmacy'],
  supplement: ['rossmann', 'hebe', 'pharmacy'],
};

export function isBuiltInCategory(
  category: string,
): category is BuiltInCategory {
  return (BUILT_IN_CATEGORIES as string[]).includes(category);
}

export function supportsStrength(category: string): boolean {
  return !['care', 'nasal-spray', 'eye-drops'].includes(category);
}

export function strengthTextKeys(unit: ProductUnit | null): {
  placeholder: string;
  hint: string;
} {
  return unit === 'drop'
    ? {
        placeholder: 'editor.strengthPlaceholderDrop',
        hint: 'editor.strengthHintDrop',
      }
    : {
        placeholder: 'editor.strengthPlaceholder',
        hint: 'editor.strengthHint',
      };
}

export function categoryUnit(category: string): ProductUnit | null {
  if (category === 'nasal-spray') return 'spray';
  if (category === 'eye-drops') return 'drop';
  return null;
}

export function unitAfterCategoryChange(
  previous: string,
  next: string,
  unit: ProductUnit | null,
): ProductUnit | null {
  const forced = categoryUnit(next);
  if (forced) return forced;
  return categoryUnit(previous) ? null : unit;
}

export function packSizeInMl(category: string): boolean {
  return category === 'eye-drops';
}

export function supportsFasting(category: string): boolean {
  return category === 'medication';
}

export function storeSuggestionKeys(category: string): string[] {
  return isBuiltInCategory(category)
    ? BUILT_IN_STORE_SUGGESTIONS[category]
    : [];
}

export function builtInForName(name: string): BuiltInCategory | undefined {
  const key = cleanCategoryName(name).toLowerCase();
  const slug = key.replace(/ /g, '-');
  return (
    BUILT_IN_CATEGORIES.find((c) => c === slug) ?? BUILT_IN_LABELS.get(key)
  );
}

export function normalizeCategory(
  raw: string,
  existingCustomCategories: string[],
): string | null {
  const cleaned = cleanCategoryName(raw);
  if (cleaned === '') return null;
  const key = cleaned.toLowerCase();
  const builtIn = builtInForName(cleaned);
  if (builtIn) return builtIn;
  return (
    existingCustomCategories.find((c) => c.toLowerCase() === key) ?? cleaned
  );
}

export function checkCustomCategoryName(
  raw: string,
  currentName: string | null,
  customCategories: string[],
): CategoryNameCheck {
  const others = customCategories.filter(
    (c) => c.toLowerCase() !== currentName?.toLowerCase(),
  );
  const name = normalizeCategory(raw, others);
  if (name === null) return { error: 'blank' };
  if (isBuiltInCategory(name) || others.includes(name)) {
    return { error: 'taken' };
  }
  return { name };
}

export function categoryLabel(category: string, t: Translate): string {
  return isBuiltInCategory(category) ? t(`category.${category}`) : category;
}

function cleanCategoryName(raw: string): string {
  return raw.trim().replace(/\s+/g, ' ');
}
