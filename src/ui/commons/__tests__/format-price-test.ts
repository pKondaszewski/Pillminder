import { formatPrice } from '../format-price';

describe('formatPrice', () => {
  it.each([
    [25, 'PLN', 'pl', '25 zł'],
    [25, 'EUR', 'pl', '25 €'],
    [25, 'USD', 'en', '$25'],
  ] as const)('formats %s %s in %s', (amount, currency, locale, expected) => {
    // when
    const text = formatPrice(amount, currency, locale);

    // then
    expect(text.replace(/\s/g, ' ')).toBe(expected);
  });
});
