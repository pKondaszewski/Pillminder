import { useEffect, useState } from 'react';

import { createLogger } from '@/config/logger';
import {
  dismissBatteryPrompt,
  dismissNotificationsPrompt,
  getOnboardingSteps,
  type OnboardingStep,
} from '@/onboarding/onboarding-service';

const log = createLogger('use-onboarding');

export function useOnboarding(enabled: boolean) {
  const [steps, setSteps] = useState<OnboardingStep[] | null>(null);

  useEffect(() => {
    if (!enabled) return;
    getOnboardingSteps()
      .then(setSteps)
      .catch((err) => {
        // Never block the app on a failed permission check
        log.error('Onboarding check failed', err);
        setSteps([]);
      });
  }, [enabled]);

  const step = steps?.[0] ?? null;

  const advance = () => setSteps((current) => current?.slice(1) ?? []);

  const dismiss = () => {
    if (step === 'notifications') dismissNotificationsPrompt();
    if (step === 'battery') dismissBatteryPrompt();
    advance();
  };

  return {
    ready: steps !== null,
    step,
    advance,
    dismiss,
  };
}
