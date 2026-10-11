import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking } from 'react-native';

import { permissionStep } from '@/onboarding/onboarding-service';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useNotificationPermission } from '@/ui/hooks/use-notification-permission';

import {
  OnboardingStepLayout,
  PrimaryButton,
  SkipButton,
} from './onboarding-step-layout';

export function NotificationsStep({
  onGranted,
  onDismissed,
}: {
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

  return (
    <OnboardingStepLayout
      texts={
        <>
          <ThemedText type="title">{t('onboarding.title')}</ThemedText>
          <ThemedText themeColor="textSecondary">
            {t('onboarding.intro')}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            • {t('onboarding.featureDose')}
          </ThemedText>
          <ThemedText themeColor="textSecondary">
            • {t('onboarding.featureReorder')}
          </ThemedText>
          {step === 'blocked' && (
            <ThemedText type="smallBold">{t('onboarding.blocked')}</ThemedText>
          )}
        </>
      }
      actions={
        <>
          {step === 'askable' ? (
            <PrimaryButton
              label={t('onboarding.allow')}
              onPress={request}
              disabled={busy}
            />
          ) : (
            <PrimaryButton
              label={t('onboarding.openSettings')}
              onPress={() => void Linking.openSettings()}
            />
          )}
          <SkipButton
            label={t(
              step === 'askable' ? 'onboarding.notNow' : 'onboarding.continue',
            )}
            onPress={onDismissed}
          />
        </>
      }
    />
  );
}
