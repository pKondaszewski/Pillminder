import type { Currency } from './settings-store';

export function formatPrice(
  amount: number,
  currency: Currency,
  locale: string,
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function currencySymbol(currency: Currency, locale: string): string {
  return (
    new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      currencyDisplay: 'symbol',
    })
      .formatToParts(0)
      .find((part) => part.type === 'currency')?.value ?? currency
  );
}

export function currencyLabel(currency: Currency, locale: string): string {
  const symbol = currencySymbol(currency, locale);
  return symbol === currency ? currency : `${symbol} (${currency})`;
}
