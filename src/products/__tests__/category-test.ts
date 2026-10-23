import type { Translate } from '@/config/translate';

import {
  categoryLabel,
  categoryUnit,
  checkCustomCategoryName,
  isBuiltInCategory,
  normalizeCategory,
  packSizeInMl,
  storeSuggestionKeys,
  strengthTextKeys,
  supportsFasting,
  supportsStrength,
  unitAfterCategoryChange,
} from '../category';
import type { ProductUnit } from '../dto/product-unit';

describe('normalizeCategory', () => {
  it('returns null for a blank name', () => {
    // when
    const result = normalizeCategory('  \t ', []);

    // then
    expect(result).toBeNull();
  });

  it('trims and collapses whitespace in a new custom name', () => {
    // when
    const result = normalizeCategory('  Vet   gel ', []);

    // then
    expect(result).toBe('Vet gel');
  });

  it.each(['Medication', ' CARE ', 'supplement'])(
    'maps "%s" to the built-in key',
    (raw) => {
      // when
      const result = normalizeCategory(raw, ['Vet gel']);

      // then
      expect(result).toBe(raw.trim().toLowerCase());
    },
  );

  it('reuses the spelling of an existing custom category ignoring case', () => {
    // given
    const existing = ['Vet gel', 'Vet'];

    // when
    const result = normalizeCategory('vet GEL', existing);

    // then
    expect(result).toBe('Vet gel');
  });

  it('keeps a distinct name distinct from existing ones', () => {
    // when
    const result = normalizeCategory('Vet cream', ['Vet gel']);

    // then
    expect(result).toBe('Vet cream');
  });
});

describe('category-dependent behaviour', () => {
  it('recognizes built-in categories only by exact key', () => {
    // when
    const results = ['care', 'Care', 'Vet gel'].map(isBuiltInCategory);

    // then
    expect(results).toEqual([true, false, false]);
  });

  it.each([
    ['medication', true],
    ['supplement', true],
    ['care', false],
    ['Vet gel', true],
  ])('supportsStrength(%s) is %s', (category, expected) => {
    // when
    const result = supportsStrength(category);

    // then
    expect(result).toBe(expected);
  });

  it.each([
    ['medication', true],
    ['supplement', false],
    ['care', false],
    ['Vet gel', false],
  ])('supportsFasting(%s) is %s', (category, expected) => {
    // when
    const result = supportsFasting(category);

    // then
    expect(result).toBe(expected);
  });

  it('suggests stores for built-in categories and none for a custom one', () => {
    // when
    const medication = storeSuggestionKeys('medication');
    const custom = storeSuggestionKeys('Vet gel');

    // then
    expect(medication).toEqual(['pharmacy']);
    expect(custom).toEqual([]);
  });
});

describe('categoryLabel', () => {
  it('translates a built-in and shows a custom name as typed', () => {
    // given
    const t: Translate = (key) => `t:${key}`;

    // when
    const labels = ['care', 'Vet gel'].map((c) => categoryLabel(c, t));

    // then
    expect(labels).toEqual(['t:category.care', 'Vet gel']);
  });
});

describe('nasal spray and eye drops', () => {
  it.each([
    ['Nasal spray', 'nasal-spray'],
    ['eye   drops', 'eye-drops'],
    ['Spray do nosa', 'nasal-spray'],
    ['KROPLE DO OCZU', 'eye-drops'],
  ])(
    'built-in wins over an existing custom "%s" and gives %s',
    (raw, expected) => {
      // given
      const existingCustom = [raw];

      // when
      const result = normalizeCategory(raw, existingCustom);

      // then
      expect(result).toBe(expected);
    },
  );

  it.each([
    ['nasal-spray', 'spray'],
    ['eye-drops', 'drop'],
    ['medication', null],
    ['Vet gel', null],
  ])('categoryUnit(%s) is %s', (category, expected) => {
    // when
    const result = categoryUnit(category);

    // then
    expect(result).toBe(expected);
  });

  it.each(['nasal-spray', 'eye-drops'])(
    'has no strength and no fasting for %s, but a pharmacy suggestion',
    (category) => {
      // when
      const result = [
        supportsStrength(category),
        supportsFasting(category),
        storeSuggestionKeys(category),
      ];

      // then
      expect(result).toEqual([false, false, ['pharmacy']]);
    },
  );

  it.each([
    ['drop', 'editor.strengthPlaceholderDrop', 'editor.strengthHintDrop'],
    ['tablet', 'editor.strengthPlaceholder', 'editor.strengthHint'],
  ] as const)(
    'picks the strength texts for unit %s',
    (unit, placeholder, hint) => {
      // when
      const result = strengthTextKeys(unit);

      // then
      expect(result).toEqual({ placeholder, hint });
    },
  );

  it('takes the pack size in ml only for eye drops', () => {
    // when
    const result = ['eye-drops', 'nasal-spray', 'medication'].map(packSizeInMl);

    // then
    expect(result).toEqual([true, false, false]);
  });

  it.each([
    ['eye-drops', 'medication', 'drop', null],
    ['nasal-spray', 'eye-drops', 'spray', 'drop'],
    ['medication', 'supplement', 'tablet', 'tablet'],
    ['medication', 'nasal-spray', 'tablet', 'spray'],
  ])(
    'unit after %s -> %s with "%s" is %s',
    (previous, next, unit, expected) => {
      // when
      const result = unitAfterCategoryChange(
        previous,
        next,
        unit as ProductUnit,
      );

      // then
      expect(result).toBe(expected);
    },
  );
});

describe('checkCustomCategoryName', () => {
  const custom = ['Vitamins', 'Herbs'];

  it('accepts a new name, cleaned', () => {
    // when
    const result = checkCustomCategoryName('  Minerals  ', 'Vitamins', custom);

    // then
    expect(result).toEqual({ name: 'Minerals' });
  });

  it('accepts a change of letter case of the edited category', () => {
    // when
    const result = checkCustomCategoryName('vitamins', 'Vitamins', custom);

    // then
    expect(result).toEqual({ name: 'vitamins' });
  });

  it('accepts any free name for a new category', () => {
    // when
    const result = checkCustomCategoryName('Tea', null, custom);

    // then
    expect(result).toEqual({ name: 'Tea' });
  });

  it('rejects a blank name', () => {
    // when
    const result = checkCustomCategoryName('   ', 'Vitamins', custom);

    // then
    expect(result).toEqual({ error: 'blank' });
  });

  it.each(['Care', 'care', 'Spray do nosa', 'KROPLE DO OCZU', 'eye drops'])(
    'rejects "%s" as a built-in category',
    (raw) => {
      // when
      const result = checkCustomCategoryName(raw, 'Vitamins', custom);

      // then
      expect(result).toEqual({ error: 'taken' });
    },
  );

  it.each(['Herbs', 'herbs', ' HERBS '])(
    'rejects "%s" as another custom category',
    (raw) => {
      // when
      const result = checkCustomCategoryName(raw, 'Vitamins', custom);

      // then
      expect(result).toEqual({ error: 'taken' });
    },
  );
});
