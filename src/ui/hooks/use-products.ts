import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  cancelFutureDosesForSchedule,
  syncDosesForSchedule,
} from '@/doses/dose-service';
import {
  addProduct,
  editProduct,
  getProductsQuery,
  removeProduct,
  setProductStatus,
} from '@/products/product-service';
import { getSchedulesByProduct } from '@/schedules/schedule-service';

export function useProducts() {
  const { data } = useLiveQuery(getProductsQuery());

  const archive = async (id: string) => {
    await setProductStatus(id, 'archived');
    const schedules = await getSchedulesByProduct(id);
    await Promise.all(
      schedules.map((schedule) => cancelFutureDosesForSchedule(schedule.id)),
    );
  };

  const restore = async (id: string) => {
    await setProductStatus(id, 'active');
    const schedules = await getSchedulesByProduct(id);
    await Promise.all(
      schedules.map((schedule) => syncDosesForSchedule(schedule)),
    );
  };

  return {
    products: data,
    addProduct,
    editProduct,
    removeProduct,
    archiveProduct: archive,
    restoreProduct: restore,
  };
}
