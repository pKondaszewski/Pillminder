import { createLogger } from '@/config/logger';

import {
  deleteImageFiles,
  imageFileSize,
  imageFileUri,
  listImageFileNames,
  replaceImageFileIfSmaller,
  storeImageFile,
} from './image-files';
import {
  createImageRow,
  deleteImageRow,
  deleteImageRowsByFileNames,
  getAllImageFileNames,
  imagesByProductQuery,
  type ProductImage,
  restoreImageRow,
  setProfileImageRow,
} from './image-repository';
import { shrinkImage } from './image-shrinker';
import { needsShrinking } from './image-size';

export type { ImageSource } from './dto/image-source';
export {
  deleteAllImageFiles,
  deleteImageFiles,
  imageFileUri,
} from './image-files';
export { pickImage } from './image-picker';
export type { ProductImage } from './image-repository';
export { getImageFileNamesByProduct } from './image-repository';
export { orderPhotos } from './order-photos';

const log = createLogger('image-service');

export function getImagesQuery(productId: string) {
  return imagesByProductQuery(productId);
}

export async function addImage(
  productId: string,
  sourceUri: string,
): Promise<ProductImage> {
  log.info(`Adding image to product ${productId}`);
  const fileName = storeImageFile(sourceUri);
  try {
    return await createImageRow(productId, fileName);
  } catch (err) {
    log.error(`Failed to add image to product ${productId}`, err);
    deleteImageFiles([fileName]);
    throw err;
  }
}

// Undoing an add has nothing left to undo, so the file goes at once
export async function discardAddedImage(image: ProductImage): Promise<void> {
  log.info(`Discarding added image ${image.id}`);
  try {
    await deleteImageRow(image.id);
  } catch (err) {
    log.error(`Failed to discard image ${image.id}`, err);
    throw err;
  }
  deleteImageFiles([image.fileName]);
}

// The file stays so restoreImage can bring it back; the next start cleans it up
export async function removeImage(image: ProductImage): Promise<void> {
  log.info(`Deleting image ${image.id}`);
  try {
    await deleteImageRow(image.id);
  } catch (err) {
    log.error(`Failed to delete image ${image.id}`, err);
    throw err;
  }
}

export async function restoreImage(
  image: ProductImage,
  asProfile: boolean,
): Promise<void> {
  log.info(`Restoring image ${image.id}`);
  try {
    await restoreImageRow(image, asProfile);
  } catch (err) {
    log.error(`Failed to restore image ${image.id}`, err);
    throw err;
  }
}

export async function deleteOrphanedImageFiles(): Promise<void> {
  try {
    const referenced = new Set(await getAllImageFileNames());
    const orphans = listImageFileNames().filter(
      (name) => !referenced.has(name),
    );
    if (orphans.length === 0) return;
    log.info(`Deleting ${orphans.length} orphaned image files`);
    deleteImageFiles(orphans);
  } catch (err) {
    log.error('Failed to delete orphaned image files', err);
  }
}

// Photos are left out of the cloud backup, so after a restore the rows are
// back but the files are not.
export async function deleteImageRowsWithoutFile(): Promise<void> {
  try {
    const existing = new Set(listImageFileNames());
    const missing = (await getAllImageFileNames()).filter(
      (name) => !existing.has(name),
    );
    if (missing.length === 0) return;
    log.info(`Deleting ${missing.length} image rows without a file`);
    await deleteImageRowsByFileNames(missing);
  } catch (err) {
    log.error('Failed to delete image rows without a file', err);
  }
}

// Runs on every start, but only files over the size threshold are touched.
export async function shrinkOversizedImages(): Promise<void> {
  try {
    const referenced = new Set(await getAllImageFileNames());
    const oversized = listImageFileNames().filter(
      (name) => referenced.has(name) && needsShrinking(imageFileSize(name)),
    );
    for (const name of oversized) await shrinkStoredImage(name);
  } catch (err) {
    log.error('Failed to shrink oversized image files', err);
  }
}

export async function setProfileImage(
  productId: string,
  imageId: string | null,
): Promise<void> {
  log.info(
    imageId === null
      ? `Clearing the profile image of product ${productId}`
      : `Setting image ${imageId} as the profile of product ${productId}`,
  );
  try {
    await setProfileImageRow(productId, imageId);
  } catch (err) {
    log.error(`Failed to set the profile image of product ${productId}`, err);
    throw err;
  }
}

async function shrinkStoredImage(fileName: string): Promise<void> {
  try {
    const before = imageFileSize(fileName);
    const candidateUri = await shrinkImage(imageFileUri(fileName));
    if (replaceImageFileIfSmaller(fileName, candidateUri)) {
      log.info(
        `Shrunk image ${fileName} from ${before} to ${imageFileSize(fileName)} bytes`,
      );
    }
  } catch (err) {
    log.error(`Failed to shrink image ${fileName}, keeping the original`, err);
  }
}
