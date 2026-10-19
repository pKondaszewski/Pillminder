import { useTranslation } from 'react-i18next';

import type { TravelPlanEntry } from '@/products/product-service';
import { buildTravelPlan } from '@/products/travel-plan';
import { useSchedules } from '@/schedules/ui/use-schedules';

import { useProducts } from './use-products';

export function useTravelPlan(
  departure: Date,
  returnDay: Date,
): TravelPlanEntry[] {
  const { t, i18n } = useTranslation();
  const { products } = useProducts();
  const { schedules } = useSchedules();

  return buildTravelPlan(products, schedules, departure, returnDay, {
    t,
    locale: i18n.language,
    now: new Date(),
  });
}
