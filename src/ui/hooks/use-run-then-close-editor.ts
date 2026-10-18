import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export function useRunThenCloseEditor<T = unknown>(
  closeEditor: (result: T) => void,
) {
  const { t } = useTranslation();

  return async (action: () => Promise<T>, errorKey: string) => {
    try {
      closeEditor(await action());
    } catch {
      Alert.alert(t('products.errorTitle'), t(errorKey));
    }
  };
}
