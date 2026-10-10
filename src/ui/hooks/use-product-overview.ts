import { useTranslation } from 'react-i18next';

import { buildProductOverview } from '@/products/product-overview';
import type { ProductOverview } from '@/products/product-service';
import { formatDate } from '@/ui/commons/format-date';

import { useProducts } from './use-products';
import { useSchedules } from './use-schedules';

export function useProductOverview(): ProductOverview {
  const { t, i18n } = useTranslation();
  const { products } = useProducts();
  const { schedules } = useSchedules();

  return buildProductOverview(products, schedules, {
    t,
    formatDate,
    locale: i18n.language,
    now: new Date(),
  });
}
