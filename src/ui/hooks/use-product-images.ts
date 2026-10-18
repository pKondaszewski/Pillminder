import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import {
  addImage,
  DEFAULT_IMAGE_ROLE,
  getImagesQuery,
  type ImageSource,
  removeImage,
} from '@/images/image-service';
import { usePickImage } from '@/ui/hooks/use-pick-image';

export function useProductImages(productId: string) {
  const { t } = useTranslation();
  const { data } = useLiveQuery(getImagesQuery(productId), [productId]);
  const pickImageUri = usePickImage();
  const [busy, setBusy] = useState(false);

  const pickAndAddImage = async (source: ImageSource) => {
    setBusy(true);
    try {
      const uri = await pickImageUri(source);
      if (uri) await addImage(productId, uri, DEFAULT_IMAGE_ROLE);
    } catch {
      Alert.alert(t('products.errorTitle'), t('images.errorSave'));
    } finally {
      setBusy(false);
    }
  };

  return { images: data, busy, pickAndAddImage, removeImage };
}
