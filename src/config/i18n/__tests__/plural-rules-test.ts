describe('i18n plurals without native Intl.PluralRules', () => {
  const nativePluralRules = Intl.PluralRules;

  afterEach(() => {
    Object.defineProperty(Intl, 'PluralRules', {
      value: nativePluralRules,
      configurable: true,
      writable: true,
    });
  });

  it.each([
    [1, 'Pokaż 1 produkt'],
    [3, 'Pokaż 3 produkty'],
    [5, 'Pokaż 5 produktów'],
  ])('picks the Polish form for %i', (count, expected) => {
    // given
    Reflect.deleteProperty(Intl, 'PluralRules');
    let translated = '';

    // when
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: i18n } = require('../index');
      translated = i18n.t('products.showResults', { count, lng: 'pl' });
    });

    // then
    expect(translated).toBe(expected);
  });
});

describe('English unit labels', () => {
  it.each([
    ['capsule', 1, '1 cap.'],
    ['capsule', 2, '2 caps.'],
    ['drop', 1, '1 drop'],
    ['drop', 0, '0 drops'],
    ['tablet', 1, '1 tab'],
    ['tablet', 18, '18 tabs'],
    ['spray', 1, '1 spray'],
    ['spray', 3, '3 sprays'],
    ['ml', 1, '1 ml'],
  ])('writes the English %s unit for %i', (unit, count, expected) => {
    // given
    let translated = '';

    // when
    jest.isolateModules(() => {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { default: i18n } = require('../index');
      translated = i18n.t(`products.unitShort.${unit}`, { count, lng: 'en' });
    });

    // then
    expect(translated).toBe(expected);
  });
});
