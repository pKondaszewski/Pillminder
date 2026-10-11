import { useLiveQuery } from 'drizzle-orm/expo-sqlite';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import {
  addImage,
  getImagesQuery,
  type ImageRole,
  type ImageSource,
  pickImage,
  removeImage,
} from '@/images/image-service';

export function useProductImages(productId: string) {
  const { t } = useTranslation();
  const { data } = useLiveQuery(getImagesQuery(productId), [productId]);
  const [busy, setBusy] = useState(false);

  const pickAndAddImage = async (source: ImageSource, role: ImageRole) => {
    setBusy(true);
    try {
      const result = await pickImage(source);
      if (result.status === 'permissionDenied') {
        Alert.alert(t('products.errorTitle'), t('images.cameraDenied'));
      } else if (result.status === 'picked') {
        await addImage(productId, result.uri, role);
      }
    } catch {
      Alert.alert(t('products.errorTitle'), t('images.errorSave'));
    } finally {
      setBusy(false);
    }
  };

  return { images: data, busy, pickAndAddImage, removeImage };
}
