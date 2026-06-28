import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import {
  cancelFutureDosesForSchedule,
  refreshRemindersForProduct,
  syncDosesForSchedule,
} from '@/doses/dose-service';
import { cancelReorderAlert } from '@/notifications/notification-service';
import type { NewProductInput } from '@/products/dto/new-product-input';
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

  const edit = async (id: string, input: NewProductInput) => {
    await editProduct(id, input);
    await refreshRemindersForProduct(id);
  };

  const remove = async (id: string) => {
    const schedules = await getSchedulesByProduct(id);
    await Promise.all(
      schedules.map((schedule) => cancelFutureDosesForSchedule(schedule.id)),
    );
    await cancelReorderAlert(id);
    await removeProduct(id);
  };

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
    editProduct: edit,
    removeProduct: remove,
    archiveProduct: archive,
    restoreProduct: restore,
  };
}
