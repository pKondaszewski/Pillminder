import { useTranslation } from 'react-i18next';

import { SwitchRow } from '@/commons/ui/switch-row';
import { ThemedText } from '@/commons/ui/themed-text';

import { SettingsSection } from './settings-section';

type Props = {
  enabled: boolean;
  available: boolean;
  onChange: (enabled: boolean) => void;
};

export function AppLockSection({ enabled, available, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <SettingsSection title={t('settings.privacy')}>
      <SwitchRow
        label={t('settings.appLock')}
        value={enabled}
        onValueChange={onChange}
        disabled={!available && !enabled}
      />
      <ThemedText type="small" themeColor="textSecondary">
        {t(
          available || enabled
            ? 'settings.appLockDescription'
            : 'settings.appLockUnavailable',
        )}
      </ThemedText>
    </SettingsSection>
  );
}
