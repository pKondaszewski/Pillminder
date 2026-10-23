import {
  isPlainTextStore,
  mustAskStoreTarget,
  resolveStoreUrl,
} from '../store-link';

describe('resolveStoreUrl', () => {
  it.each(['maps', 'web', null] as const)(
    'returns a full URL as is for the %s target',
    (target) => {
      // when
      const result = resolveStoreUrl('https://apteka.pl/produkt/1', target);

      // then
      expect(result).toBe('https://apteka.pl/produkt/1');
    },
  );

  it('trims a full URL', () => {
    // when
    const result = resolveStoreUrl('  http://apteka.pl  ', 'maps');

    // then
    expect(result).toBe('http://apteka.pl');
  });

  it('turns a plain store name into an encoded maps search URL', () => {
    // when
    const result = resolveStoreUrl('Apteka Pod Orłem', 'maps');

    // then
    expect(result).toBe(
      'https://www.google.com/maps/search/?api=1&query=Apteka%20Pod%20Or%C5%82em',
    );
  });

  it('searches maps for a plain store name without a target', () => {
    // when
    const result = resolveStoreUrl('apteka', null);

    // then
    expect(result).toBe(
      'https://www.google.com/maps/search/?api=1&query=apteka',
    );
  });

  it('turns a plain store name into an encoded web search URL', () => {
    // when
    const result = resolveStoreUrl('allegro apap', 'web');

    // then
    expect(result).toBe('https://www.google.com/search?q=allegro%20apap');
  });

  it.each([null, undefined, '', '   '])('returns null for %p', (value) => {
    // when
    const result = resolveStoreUrl(value, 'maps');

    // then
    expect(result).toBeNull();
  });
});

describe('isPlainTextStore', () => {
  it.each([
    ['apteka', true],
    ['https://allegro.pl', false],
    ['  HTTP://allegro.pl', false],
    ['   ', false],
    [null, false],
  ] as const)('tells whether "%s" is plain text: %s', (value, expected) => {
    // when
    const result = isPlainTextStore(value);

    // then
    expect(result).toBe(expected);
  });
});

describe('mustAskStoreTarget', () => {
  it.each([
    ['apteka', null, true],
    ['apteka', 'maps', false],
    ['allegro', 'web', false],
    ['https://allegro.pl', null, false],
    [null, null, false],
  ] as const)(
    'for "%s" with the remembered target %s asks: %s',
    (storeLink, target, expected) => {
      // when
      const result = mustAskStoreTarget(storeLink, target);

      // then
      expect(result).toBe(expected);
    },
  );
});
