import type { Currency } from '@/settings/settings-store';

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

export function currencyLabel(currency: Currency, locale: string): string {
  const symbol = new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    currencyDisplay: 'symbol',
  })
    .formatToParts(0)
    .find((part) => part.type === 'currency')?.value;
  return !symbol || symbol === currency ? currency : `${symbol} (${currency})`;
}
