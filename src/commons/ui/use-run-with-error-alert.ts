import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export function useRunWithErrorAlert<T = unknown>(
  onSuccess?: (result: T) => void,
) {
  const { t } = useTranslation();

  return async (action: () => Promise<T>, errorKey: string) => {
    try {
      onSuccess?.(await action());
    } catch {
      Alert.alert(t('products.errorTitle'), t(errorKey));
    }
  };
}
