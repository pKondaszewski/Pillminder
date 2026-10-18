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
  setProfileImage,
} from '@/images/image-service';
import { usePickImage } from '@/ui/hooks/use-pick-image';

interface ProfileUndo {
  key: number;
  previousImageId: string | null;
}

export function useProductImages(
  productId: string,
  profileImageId: string | null,
) {
  const { t } = useTranslation();
  const { data } = useLiveQuery(getImagesQuery(productId), [productId]);
  const pickImageUri = usePickImage();
  const [busy, setBusy] = useState(false);
  const [profileUndo, setProfileUndo] = useState<ProfileUndo | null>(null);

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

  const changeProfile = async (imageId: string | null) => {
    try {
      await setProfileImage(productId, imageId);
      return true;
    } catch {
      Alert.alert(t('products.errorTitle'), t('images.errorProfile'));
      return false;
    }
  };

  const setProfile = async (imageId: string) => {
    if (imageId === profileImageId) return;
    const previousImageId = profileImageId;
    if (await changeProfile(imageId)) {
      setProfileUndo((last) => ({
        key: (last?.key ?? 0) + 1,
        previousImageId,
      }));
    }
  };

  const undoProfile = async () => {
    if (!profileUndo) return;
    setProfileUndo(null);
    await changeProfile(profileUndo.previousImageId);
  };

  const dismissProfileUndo = () => setProfileUndo(null);

  return {
    images: data,
    busy,
    pickAndAddImage,
    removeImage,
    setProfile,
    profileUndo,
    undoProfile,
    dismissProfileUndo,
  };
}
