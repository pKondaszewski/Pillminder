import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BackupImportDialog } from '@/backup/ui/backup-import-dialog';
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from '@/commons/ui/button';
import { ConfirmDialog } from '@/commons/ui/confirm-dialog';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useMigrationRecovery } from '@/recovery/ui/use-migration-recovery';

type Props = {
  error: Error;
  onRerunMigrations: () => void;
};

export function MigrationErrorScreen({ error, onRerunMigrations }: Props) {
  const { t } = useTranslation();
  const { busy, retry, restore, reset, importConfirmation, resetConfirmation } =
    useMigrationRecovery(onRerunMigrations);
  const [detailsVisible, setDetailsVisible] = useState(false);

  return (
    <ThemedView style={styles.screen}>
      <SafeAreaView style={styles.screen}>
        <ScrollView contentContainerStyle={styles.content}>
          <ThemedText type="subtitle">{t('migrationError.title')}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('migrationError.message')}
          </ThemedText>

          <ActionRow>
            <PrimaryButton
              label={t('migrationError.retry')}
              onPress={retry}
              disabled={busy}
              busy={busy}
            />
          </ActionRow>
          <ActionRow>
            <SecondaryButton
              label={t('migrationError.restore')}
              onPress={restore}
              disabled={busy}
              busy={busy}
            />
          </ActionRow>
          <ActionRow>
            <DestructiveButton
              label={t('migrationError.reset')}
              onPress={reset}
              disabled={busy}
              busy={busy}
            />
          </ActionRow>

          <Pressable
            onPress={() => setDetailsVisible((visible) => !visible)}
            accessibilityRole="button"
            accessibilityState={{ expanded: detailsVisible }}
          >
            <ThemedText type="small" themeColor="textSecondary">
              {detailsVisible
                ? t('migrationError.hideDetails')
                : t('migrationError.details')}
            </ThemedText>
          </Pressable>
          {detailsVisible && (
            <ThemedText type="small" themeColor="textSecondary" selectable>
              {error.message}
            </ThemedText>
          )}
        </ScrollView>
      </SafeAreaView>
      <BackupImportDialog confirmation={importConfirmation} />
      <ConfirmDialog
        visible={resetConfirmation.pending !== null}
        destructive
        title={t('migrationError.resetConfirmTitle')}
        message={t('migrationError.resetConfirmMessage')}
        confirmLabel={t('migrationError.resetConfirmAction')}
        onConfirm={resetConfirmation.confirm}
        onCancel={resetConfirmation.cancel}
      />
    </ThemedView>
  );
}

function ActionRow({ children }: { children: React.ReactNode }) {
  return <View style={styles.row}>{children}</View>;
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    gap: Spacing.sixteen,
    padding: Spacing.twentyFour,
  },
  row: {
    flexDirection: 'row',
  },
});
