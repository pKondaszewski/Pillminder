import {
  cancelFutureDosesForSchedules,
  refreshRemindersForProduct,
  syncDosesForSchedules,
} from '@/doses/dose-service';
import { cancelReorderAlert } from '@/notifications/notification-service';
import { getSchedulesByProduct } from '@/schedules/schedule-service';

import type { NewProductInput } from './dto/new-product-input';
import {
  deleteProduct,
  setProductStatus,
  updateProduct,
} from './product-service';

export async function editProduct(
  id: string,
  input: NewProductInput,
): Promise<void> {
  await updateProduct(id, input);
  await refreshRemindersForProduct(id);
}

export async function removeProduct(id: string): Promise<void> {
  const schedules = await getSchedulesByProduct(id);
  await cancelFutureDosesForSchedules(schedules.map((s) => s.id));
  await cancelReorderAlert(id);
  await deleteProduct(id);
}

export async function archiveProduct(id: string): Promise<void> {
  await setProductStatus(id, 'archived');
  const schedules = await getSchedulesByProduct(id);
  await cancelFutureDosesForSchedules(schedules.map((s) => s.id));
}

export async function restoreProduct(id: string): Promise<void> {
  await setProductStatus(id, 'active');
  const schedules = await getSchedulesByProduct(id);
  await syncDosesForSchedules(schedules);
}
