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

const BUILT_IN_ALIASES: Record<string, BuiltInCategory> = {
  'spray do nosa': 'nasal-spray',
  'krople do oczu': 'eye-drops',
};

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

export function normalizeCategory(
  raw: string,
  existingCustomCategories: string[],
): string | null {
  const cleaned = raw.trim().replace(/\s+/g, ' ');
  if (cleaned === '') return null;
  const key = cleaned.toLowerCase();
  const slug = key.replace(/ /g, '-');
  const builtIn =
    BUILT_IN_CATEGORIES.find((c) => c === slug) ?? BUILT_IN_ALIASES[key];
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
