import {
  isBuiltInCategory,
  normalizeCategory,
  storeSuggestionKeys,
  supportsStrength,
} from '../category';

describe('normalizeCategory', () => {
  it('returns null for a blank name', () => {
    // when
    const result = normalizeCategory('  \t ', []);

    // then
    expect(result).toBeNull();
  });

  it('trims and collapses whitespace in a new custom name', () => {
    // when
    const result = normalizeCategory('  Eye   drops ', []);

    // then
    expect(result).toBe('Eye drops');
  });

  it.each(['Medication', ' CARE ', 'supplement'])(
    'maps "%s" to the built-in key',
    (raw) => {
      // when
      const result = normalizeCategory(raw, ['Eye drops']);

      // then
      expect(result).toBe(raw.trim().toLowerCase());
    },
  );

  it('reuses the spelling of an existing custom category ignoring case', () => {
    // given
    const existing = ['Eye drops', 'Vet'];

    // when
    const result = normalizeCategory('eye DROPS', existing);

    // then
    expect(result).toBe('Eye drops');
  });

  it('keeps a distinct name distinct from existing ones', () => {
    // when
    const result = normalizeCategory('Eye gel', ['Eye drops']);

    // then
    expect(result).toBe('Eye gel');
  });
});

describe('category-dependent behaviour', () => {
  it('recognizes built-in categories only by exact key', () => {
    // when
    const results = ['care', 'Care', 'Eye drops'].map(isBuiltInCategory);

    // then
    expect(results).toEqual([true, false, false]);
  });

  it.each([
    ['medication', true],
    ['supplement', true],
    ['care', false],
    ['Eye drops', true],
  ])('supportsStrength(%s) is %s', (category, expected) => {
    // when
    const result = supportsStrength(category);

    // then
    expect(result).toBe(expected);
  });

  it('suggests stores for built-in categories and none for a custom one', () => {
    // when
    const medication = storeSuggestionKeys('medication');
    const custom = storeSuggestionKeys('Eye drops');

    // then
    expect(medication).toEqual(['pharmacy']);
    expect(custom).toEqual([]);
  });
});
