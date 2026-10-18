import * as Crypto from 'expo-crypto';
import { Directory, File, Paths } from 'expo-file-system';

const DEFAULT_EXTENSION = '.jpg';

const imagesDirectory = new Directory(Paths.document, 'product-images');

export function imageFileUri(fileName: string): string {
  return new File(imagesDirectory, fileName).uri;
}

// The database keeps only the returned name, not the path.
export function storeImageFile(sourceUri: string): string {
  const source = new File(sourceUri);
  const fileName = `${Crypto.randomUUID()}${source.extension || DEFAULT_EXTENSION}`;
  imagesDirectory.create({ idempotent: true });
  source.moveSync(new File(imagesDirectory, fileName));
  return fileName;
}

export function deleteImageFiles(fileNames: string[]): void {
  fileNames
    .map((fileName) => new File(imagesDirectory, fileName))
    .filter((file) => file.exists)
    .forEach((file) => file.delete());
}

export function listImageFileNames(): string[] {
  if (!imagesDirectory.exists) return [];
  return imagesDirectory
    .list()
    .filter((entry): entry is File => entry instanceof File)
    .map((file) => file.name);
}

export function deleteAllImageFiles(): void {
  if (imagesDirectory.exists) imagesDirectory.delete();
}
