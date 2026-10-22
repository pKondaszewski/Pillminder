import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';

import { TutorialSkipButton } from './tutorial-skip-button';
import { useTutorial } from './use-tutorial';

const FORM_STEPS: Record<'product' | 'schedule', string> = {
  product: 'tutorial.productTitle',
  schedule: 'tutorial.scheduleTitle',
};

export function TutorialBanner({ step }: { step: 'product' | 'schedule' }) {
  const { t } = useTranslation();
  const theme = useTheme();
  const { step: current, skip } = useTutorial();

  if (current !== step) return null;

  return (
    <ThemedView
      style={[
        styles.banner,
        { backgroundColor: theme.cardGlass, borderColor: theme.border },
      ]}
    >
      <ThemedText type="smallBold" style={styles.title}>
        {t(FORM_STEPS[step])}
      </ThemedText>
      <TutorialSkipButton onSkip={skip} />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.eight,
    marginHorizontal: Spacing.sixteen,
    marginTop: Spacing.eight,
    paddingLeft: Spacing.sixteen,
    paddingRight: Spacing.twelve,
    borderRadius: Radius.card,
    borderWidth: StyleSheet.hairlineWidth,
  },
  title: {
    flex: 1,
  },
});
