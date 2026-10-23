import { useSyncExternalStore } from 'react';
import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import type { ImageSource } from '@/images/image-service';
import { withProfilePhoto } from '@/products/pending-photos';
import {
  getPendingUris,
  setPendingUris,
  subscribeToPendingUris,
} from '@/products/ui/pending-photos-store';
import type { PhotoItem } from '@/products/ui/photo-gallery';
import { usePickImage } from '@/products/ui/use-pick-image';

export function usePendingPhotoUris(): string[] {
  return useSyncExternalStore(subscribeToPendingUris, getPendingUris);
}

// The first photo is the profile one, same as the order on the photos screen.
export function usePendingPhotos(runWithUndo: RunWithUndo) {
  const { t } = useTranslation();
  const pickImageUris = usePickImage();
  const uris = usePendingPhotoUris();

  const photos: PhotoItem[] = uris.map((uri) => ({ id: uri, uri }));

  const changeWithUndo = (
    next: string[],
    messageKey: string,
    errorKey: string,
  ) => {
    const previous = uris;
    return runWithUndo(
      {
        message: t(messageKey),
        apply: () => setPendingUris(next),
        revert: () => setPendingUris(previous),
      },
      errorKey,
    );
  };

  const addPhotos = async (source: ImageSource) => {
    const picked = await pickImageUris(source, source === 'gallery');
    const added = picked.filter((uri) => !uris.includes(uri));
    if (added.length === 0) return;
    await changeWithUndo(
      [...uris, ...added],
      'images.added',
      'images.errorSave',
    );
  };

  const removePhoto = (uri: string) =>
    changeWithUndo(
      uris.filter((existing) => existing !== uri),
      'images.removed',
      'images.errorDelete',
    );

  const setProfilePhoto = async (uri: string) => {
    if (uri === uris[0]) return;
    await changeWithUndo(
      withProfilePhoto(uris, uri),
      'images.profileChanged',
      'images.errorProfile',
    );
  };

  return { uris, photos, addPhotos, removePhoto, setProfilePhoto };
}
