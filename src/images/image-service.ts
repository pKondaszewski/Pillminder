import { createLogger } from '@/config/logger';

import { deleteImageFiles, storeImageFile } from './image-files';
import {
  createImageRow,
  deleteImageRow,
  imagesByProductQuery,
  type ProductImage,
} from './image-repository';
import type { ImageRole } from './image-role';

export {
  deleteAllImageFiles,
  deleteImageFiles,
  imageFileUri,
} from './image-files';
export { type ImageSource, pickImage } from './image-picker';
export type { ProductImage } from './image-repository';
export { getImageFileNamesByProduct } from './image-repository';
export { IMAGE_ROLES, type ImageRole } from './image-role';

const log = createLogger('image-service');

export function getImagesQuery(productId: string) {
  return imagesByProductQuery(productId);
}

export async function addImage(
  productId: string,
  sourceUri: string,
  role: ImageRole,
): Promise<void> {
  log.info(`Adding ${role} image to product ${productId}`);
  const fileName = storeImageFile(sourceUri);
  try {
    await createImageRow(productId, fileName, role);
  } catch (err) {
    log.error(`Failed to add image to product ${productId}`, err);
    deleteImageFiles([fileName]);
    throw err;
  }
}

export async function removeImage(image: ProductImage): Promise<void> {
  log.info(`Deleting image ${image.id}`);
  try {
    await deleteImageRow(image.id);
  } catch (err) {
    log.error(`Failed to delete image ${image.id}`, err);
    throw err;
  }
  deleteImageFiles([image.fileName]);
}
