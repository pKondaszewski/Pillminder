import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { permissionStep } from '@/onboarding/onboarding-service';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useNotificationPermission } from '@/ui/hooks/use-notification-permission';

import { BlockedSteps } from './blocked-steps';
import {
  type OnboardingProgress,
  OnboardingStepLayout,
} from './onboarding-step-layout';
import { SampleReminderCard } from './sample-reminder-card';

export function NotificationsStep({
  progress,
  onGranted,
  onDismissed,
}: {
  progress: OnboardingProgress;
  onGranted: () => void;
  onDismissed: () => void;
}) {
  const { t } = useTranslation();
  const { permission, busy, request } = useNotificationPermission();
  const step = permission ? permissionStep(permission) : null;

  useEffect(() => {
    if (step === 'granted') onGranted();
  }, [step, onGranted]);

  if (!step || step === 'granted') return null;

  const blocked = step === 'blocked';

  return (
    <OnboardingStepLayout
      progress={progress}
      primaryLabel={t(blocked ? 'onboarding.openSettings' : 'onboarding.allow')}
      onPrimary={blocked ? () => void Linking.openSettings() : request}
      primaryDisabled={busy}
      skipLabel={t(blocked ? 'onboarding.continue' : 'onboarding.notNow')}
      onSkip={onDismissed}
    >
      {blocked ? (
        <>
          <ThemedText type="title">{t('onboarding.blockedTitle')}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('onboarding.blocked')}
          </ThemedText>
          <BlockedSteps />
        </>
      ) : (
        <>
          <ThemedText type="title">{t('onboarding.title')}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('onboarding.intro')}
          </ThemedText>
          <SampleReminderCard />
          <ThemedText themeColor="textSecondary">
            • {t('onboarding.featureDose')}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            • {t('onboarding.featureReorder')}
          </ThemedText>
        </>
      )}
    </OnboardingStepLayout>
  );
}
