import {
  cancelFutureDosesForSchedules,
  refreshRemindersForProduct,
  syncDosesForSchedules,
} from '@/doses/dose-service';
import {
  deleteImageFiles,
  getImageFileNamesByProduct,
} from '@/images/image-service';
import { addNote } from '@/notes/note-service';
import { cancelReorderAlert } from '@/notifications/notification-service';
import { getSchedulesByProduct } from '@/schedules/schedule-service';

import type { NewProductInput } from './dto/new-product-input';
import {
  addPackToStock,
  deleteProduct,
  listProductIdsByCategory,
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

export async function restockPack(id: string): Promise<void> {
  await addPackToStock(id);
  await cancelReorderAlert(id);
}

export async function removeProduct(id: string): Promise<void> {
  const schedules = await getSchedulesByProduct(id);
  await cancelFutureDosesForSchedules(schedules.map((s) => s.id));
  await cancelReorderAlert(id);
  const imageFileNames = await getImageFileNamesByProduct(id);
  await deleteProduct(id);
  deleteImageFiles(imageFileNames);
}

export async function removeCategoryProducts(
  category: string,
): Promise<string[]> {
  const ids = await listProductIdsByCategory(category);
  for (const id of ids) await removeProduct(id);
  return ids;
}

export async function archiveProduct(
  id: string,
  completionNote?: string,
): Promise<void> {
  await setProductStatus(id, 'archived');
  const schedules = await getSchedulesByProduct(id);
  await cancelFutureDosesForSchedules(schedules.map((s) => s.id));
  if (completionNote) await addNote(id, completionNote);
}

export async function restoreProduct(id: string): Promise<void> {
  await setProductStatus(id, 'active');
  const schedules = await getSchedulesByProduct(id);
  await syncDosesForSchedules(schedules);
}
