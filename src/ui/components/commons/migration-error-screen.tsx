import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/ui/commons/constants/theme';
import {
  DestructiveButton,
  PrimaryButton,
  SecondaryButton,
} from '@/ui/components/commons/button';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useMigrationRecovery } from '@/ui/hooks/use-migration-recovery';

type Props = {
  error: Error;
  onRerunMigrations: () => void;
};

export function MigrationErrorScreen({ error, onRerunMigrations }: Props) {
  const { t } = useTranslation();
  const { busy, retry, restore, reset } =
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
