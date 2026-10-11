import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { createLogger } from '@/config/logger';
import { openBatteryOptimizationSettings } from '@/onboarding/onboarding-service';
import { ThemedText } from '@/ui/components/commons/themed-text';

import {
  OnboardingStepLayout,
  PrimaryButton,
  SkipButton,
} from './onboarding-step-layout';

const log = createLogger('battery-step');

export function BatteryStep({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation();
  const [busy, setBusy] = useState(false);

  const openSettings = async () => {
    setBusy(true);
    try {
      await openBatteryOptimizationSettings();
      onDone();
    } catch (err) {
      log.error('Opening battery optimization settings failed', err);
      Alert.alert(
        t('onboarding.batteryFailed'),
        err instanceof Error ? err.message : '',
      );
    } finally {
      setBusy(false);
    }
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
            onPress={() => void openSettings()}
            disabled={busy}
          />
          <SkipButton label={t('onboarding.notNow')} onPress={onDone} />
        </>
      }
    />
  );
}
