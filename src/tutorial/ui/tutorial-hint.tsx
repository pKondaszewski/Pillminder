import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';

import { TutorialSkipButton } from './tutorial-skip-button';

export function TutorialHint({
  onClose,
  onSkip,
}: {
  onClose: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <ThemedView
      style={[
        styles.hint,
        { backgroundColor: theme.cardGlass, borderColor: theme.border },
      ]}
    >
      <ThemedText type="smallBold">{t('tutorial.hint')}</ThemedText>
      <ThemedView style={styles.actions}>
        <Pressable
          onPress={onClose}
          accessibilityRole="button"
          style={styles.close}
        >
          <ThemedText type="smallBold" themeColor="textSecondary">
            {t('tutorial.close')}
          </ThemedText>
        </Pressable>
        <TutorialSkipButton onSkip={onSkip} />
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  hint: {
    gap: Spacing.four,
    padding: Spacing.twelve,
    borderRadius: Radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: Spacing.sixteen,
  },
  close: { minHeight: 44, justifyContent: 'center' },
});
