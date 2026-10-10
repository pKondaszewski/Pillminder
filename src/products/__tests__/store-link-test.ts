import { resolveStoreUrl } from '../store-link';

describe('resolveStoreUrl', () => {
  it('returns a full URL as is', () => {
    // when
    const result = resolveStoreUrl('https://apteka.pl/produkt/1');

    // then
    expect(result).toBe('https://apteka.pl/produkt/1');
  });

  it('trims a full URL', () => {
    // when
    const result = resolveStoreUrl('  http://apteka.pl  ');

    // then
    expect(result).toBe('http://apteka.pl');
  });

  it('turns a plain store name into an encoded maps search URL', () => {
    // when
    const result = resolveStoreUrl('Apteka Pod Orłem');

    // then
    expect(result).toBe(
      'https://www.google.com/maps/search/?api=1&query=Apteka%20Pod%20Or%C5%82em',
    );
  });

  it.each([null, undefined, '', '   '])('returns null for %p', (value) => {
    // when
    const result = resolveStoreUrl(value);

    // then
    expect(result).toBeNull();
  });
});
