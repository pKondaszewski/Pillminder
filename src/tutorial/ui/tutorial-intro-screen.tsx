import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { OnboardingStepLayout } from '@/onboarding/ui/onboarding-step-layout';

export function TutorialIntroScreen({
  onStart,
  onSkip,
}: {
  onStart: () => void;
  onSkip: () => void;
}) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <OnboardingStepLayout
          progress={{ current: 1, total: 1 }}
          primaryLabel={t('tutorial.addFirstProduct')}
          onPrimary={onStart}
          skipLabel={t('tutorial.skip')}
          onSkip={onSkip}
        >
          <ThemedText type="title">{t('tutorial.introTitle')}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('tutorial.introMessage')}
          </ThemedText>
        </OnboardingStepLayout>
      </SafeAreaView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.twentyFour,
    paddingVertical: Spacing.twentyFour,
  },
});
