import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import {
  addImage,
  discardAddedImage,
  type ImageSource,
  type ProductImage,
  removeImage,
  restoreImage,
} from '@/images/image-service';
import { usePickImage } from '@/products/ui/use-pick-image';

export function usePhotoUndo(
  productId: string,
  profileImageId: string | null,
  runWithUndo: RunWithUndo,
) {
  const { t } = useTranslation();
  const pickImageUris = usePickImage();
  const [busy, setBusy] = useState(false);

  const pickAndAddImages = async (source: ImageSource) => {
    setBusy(true);
    try {
      const uris = await pickImageUris(source, source === 'gallery');
      if (uris.length === 0) return;
      const added: ProductImage[] = [];
      await runWithUndo(
        {
          message: t('images.added'),
          apply: async () => {
            try {
              for (const uri of uris) {
                added.push(await addImage(productId, uri));
              }
            } catch (error) {
              await Promise.all(added.splice(0).map(discardAddedImage));
              throw error;
            }
          },
          revert: async () => {
            await Promise.all(added.map(discardAddedImage));
          },
        },
        'images.errorSave',
      );
    } finally {
      setBusy(false);
    }
  };

  const removeImageWithUndo = (image: ProductImage) =>
    runWithUndo(
      {
        message: t('images.removed'),
        apply: () => removeImage(image),
        revert: () => restoreImage(image, image.id === profileImageId),
      },
      'images.errorDelete',
    );

  return { busy, pickAndAddImages, removeImageWithUndo };
}
