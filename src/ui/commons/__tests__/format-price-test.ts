import { currencyLabel, formatPrice } from '../format-price';

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

describe('currencyLabel', () => {
  it.each([
    ['PLN', 'pl', 'zł (PLN)'],
    ['EUR', 'en', '€ (EUR)'],
    ['USD', 'en', '$ (USD)'],
    ['USD', 'pl', 'USD'],
  ] as const)('labels %s in %s', (currency, locale, expected) => {
    // when
    const label = currencyLabel(currency, locale);

    // then
    expect(label).toBe(expected);
  });
});
