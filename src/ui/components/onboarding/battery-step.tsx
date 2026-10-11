import { useTranslation } from 'react-i18next';

import { ThemedText } from '@/ui/components/commons/themed-text';
import { useBatteryOptimization } from '@/ui/hooks/use-battery-optimization';

import {
  OnboardingStepLayout,
  PrimaryButton,
  SkipButton,
} from './onboarding-step-layout';

export function BatteryStep({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const { busy, openSettings } = useBatteryOptimization();

  const openSettingsThenDone = async () => {
    if (await openSettings()) onDone();
  };

  return (
    <OnboardingStepLayout
      texts={
        <>
          <ThemedText type="title">{t('onboarding.batteryTitle')}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('onboarding.batteryIntro')}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('onboarding.batteryHint')}
          </ThemedText>
        </>
      }
      actions={
        <>
          <PrimaryButton
            label={t('onboarding.batteryOpen')}
            onPress={() => void openSettingsThenDone()}
            disabled={busy}
          />
          <SkipButton label={t('onboarding.notNow')} onPress={onDone} />
        </>
      }
    />
  );
}
