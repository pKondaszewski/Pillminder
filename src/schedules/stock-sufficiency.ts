import type { Translate } from '@/config/translate';
import type { ReorderStatus } from '@/products/dto/reorder-status';
import type { ProductUnit } from '@/products/product-service';
import { formatAmount } from '@/products/product-unit';

type StockSufficiency = {
  message: string;
  warning: boolean;
};

export function describeStockSufficiency(
  {
    stock,
    unit,
    status,
    hasEndDate,
  }: {
    stock: number | null;
    unit: ProductUnit | null;
    status: ReorderStatus;
    hasEndDate: boolean;
  },
  t: Translate,
  formatDate: (date: Date) => string,
): StockSufficiency | null {
  if (stock === null) return null;
  const amount = unit ? formatAmount(stock, unit, t) : String(stock);

  if (status.runOutAt === null) {
    return hasEndDate
      ? { message: t('schedule.stockCoversCourse', { amount }), warning: false }
      : null;
  }
  return {
    message: t(status.isLow ? 'schedule.stockLow' : 'schedule.stockLasts', {
      amount,
      date: formatDate(status.runOutAt),
    }),
    warning: status.isLow,
  };
}
