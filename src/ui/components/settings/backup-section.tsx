import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { SecondaryButton } from '@/ui/components/commons/button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

import { SettingsSection } from './settings-section';

type Props = {
  busy: boolean;
  onExport: () => void;
  onImport: () => void;
};

export function BackupSection({ busy, onExport, onImport }: Props) {
  const { t } = useTranslation();

  return (
    <SettingsSection title={t('backup.title')}>
      <ThemedText type="small" themeColor="textSecondary">
        {t('backup.description')}
      </ThemedText>
      <ThemedView style={styles.actions}>
        <SecondaryButton
          label={t('backup.export')}
          onPress={onExport}
          disabled={busy}
        />
        <SecondaryButton
          label={t('backup.import')}
          onPress={onImport}
          disabled={busy}
        />
      </ThemedView>
    </SettingsSection>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: Spacing.twelve,
  },
});
