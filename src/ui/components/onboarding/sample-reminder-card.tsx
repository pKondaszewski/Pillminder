import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

export function SampleReminderCard() {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ThemedView
      type="surface"
      style={[styles.card, { borderColor: theme.border }]}
    >
      <ThemedText type="smallBold">{t('notification.title')}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('onboarding.sampleBody')}
      </ThemedText>
      <ThemedView type="surface" style={styles.actions}>
        <ThemedText type="smallBold" themeColor="accent">
          {t('notification.take')}
        </ThemedText>
        <ThemedText type="smallBold" themeColor="accent">
          {t('notification.snooze')}
        </ThemedText>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  card: {
    gap: Spacing.four,
    padding: Spacing.fourteen,
    borderWidth: 1,
    borderRadius: Radius.card,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.twenty,
    paddingTop: Spacing.eight,
  },
});
