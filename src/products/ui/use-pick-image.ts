import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { type ImageSource, pickImage } from '@/images/image-service';

export function usePickImage() {
  const { t } = useTranslation();

  return async (source: ImageSource): Promise<string | null> => {
    try {
      const result = await pickImage(source);
      if (result.status === 'permissionDenied') {
        Alert.alert(t('products.errorTitle'), t('images.cameraDenied'));
      }
      return result.status === 'picked' ? result.uri : null;
    } catch {
      Alert.alert(t('products.errorTitle'), t('images.errorSave'));
      return null;
    }
  };
}
