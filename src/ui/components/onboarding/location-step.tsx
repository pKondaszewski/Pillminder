import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/ui/components/commons/themed-text';
import { useLocationPermission } from '@/ui/hooks/use-location-permission';

import {
  type OnboardingProgress,
  OnboardingStepLayout,
} from './onboarding-step-layout';

export function LocationStep({
  progress,
  onDone,
}: {
  progress: OnboardingProgress;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { busy, enable } = useLocationPermission();

  const enableThenDone = async () => {
    await enable();
    onDone();
  };

  return (
    <OnboardingStepLayout
      progress={progress}
      primaryLabel={t('onboarding.locationAllow')}
      onPrimary={() => void enableThenDone()}
      primaryDisabled={busy}
      skipLabel={t('onboarding.notNow')}
      onSkip={onDone}
    >
      <ThemedText type="title">{t('onboarding.locationTitle')}</ThemedText>
      <ThemedText themeColor="textSecondary">
        {t('onboarding.locationIntro')}
      </ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {t('onboarding.locationHint')}
      </ThemedText>
    </OnboardingStepLayout>
  );
}
