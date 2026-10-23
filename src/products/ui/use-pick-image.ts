import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { type ImageSource, pickImage } from '@/images/image-service';

export function usePickImage() {
  const { t } = useTranslation();

  return async (source: ImageSource, multiple?: boolean): Promise<string[]> => {
    try {
      const result = await pickImage(source, multiple);
      if (result.status === 'permissionDenied') {
        Alert.alert(t('products.errorTitle'), t('images.cameraDenied'));
      }
      return result.status === 'picked' ? result.uris : [];
    } catch {
      Alert.alert(t('products.errorTitle'), t('images.errorSave'));
      return [];
    }
  };
}
