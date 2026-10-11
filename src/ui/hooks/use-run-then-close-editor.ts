import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

export function useRunThenCloseEditor(closeEditor: () => void) {
  const { t } = useTranslation();

  return async (action: () => Promise<unknown>, errorKey: string) => {
    try {
      await action();
      closeEditor();
    } catch {
      Alert.alert(t('products.errorTitle'), t(errorKey));
    }
  };
}
