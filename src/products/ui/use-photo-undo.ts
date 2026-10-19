import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import {
  addImage,
  DEFAULT_IMAGE_ROLE,
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
  const pickImageUri = usePickImage();
  const [busy, setBusy] = useState(false);

  const pickAndAddImage = async (source: ImageSource) => {
    setBusy(true);
    try {
      const uri = await pickImageUri(source);
      if (!uri) return;
      let added: ProductImage;
      await runWithUndo(
        {
          message: t('images.added'),
          apply: async () => {
            added = await addImage(productId, uri, DEFAULT_IMAGE_ROLE);
          },
          revert: () => discardAddedImage(added),
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

  return { busy, pickAndAddImage, removeImageWithUndo };
}
