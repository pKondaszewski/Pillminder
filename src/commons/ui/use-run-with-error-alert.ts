import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { runReportingErrors } from '@/config/run-reporting-errors';

export function useRunWithErrorAlert<T = unknown>(
  onSuccess?: (result: T) => void,
) {
  const { t } = useTranslation();

  return (action: () => Promise<T>, errorKey: string) =>
    runReportingErrors(action, onSuccess, () =>
      Alert.alert(t('products.errorTitle'), t(errorKey)),
    );
}
