import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/ui/components/commons/themed-text';
import { useBatteryOptimization } from '@/ui/hooks/use-battery-optimization';

import { BatteryChoiceMock } from './battery-choice-mock';
import {
  type OnboardingProgress,
  OnboardingStepLayout,
} from './onboarding-step-layout';

export function BatteryStep({
  progress,
  onDone,
}: {
  progress: OnboardingProgress;
  onDone: () => void;
}) {
  const { t } = useTranslation();
  const { busy, openSettings } = useBatteryOptimization();

  const openSettingsThenDone = async () => {
    if (await openSettings()) onDone();
  };

  return (
    <OnboardingStepLayout
      progress={progress}
      primaryLabel={t('onboarding.batteryOpen')}
      onPrimary={() => void openSettingsThenDone()}
      primaryDisabled={busy}
      skipLabel={t('onboarding.notNow')}
      onSkip={onDone}
    >
      <ThemedText type="title">{t('onboarding.batteryTitle')}</ThemedText>
      <ThemedText themeColor="textSecondary">
        {t('onboarding.batteryIntro')}
      </ThemedText>
      <BatteryChoiceMock />
      <ThemedText type="small" themeColor="textSecondary">
        {t('onboarding.batteryHint')}
      </ThemedText>
    </OnboardingStepLayout>
  );
}
