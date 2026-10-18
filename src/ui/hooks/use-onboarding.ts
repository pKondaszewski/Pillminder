import { useEffect, useState } from 'react';

import { createLogger } from '@/config/logger';
import {
  dismissBatteryPrompt,
  dismissLocationPrompt,
  dismissNotificationsPrompt,
  getOnboardingSteps,
  type OnboardingStep,
} from '@/onboarding/onboarding-service';

const log = createLogger('use-onboarding');

export function useOnboarding(enabled: boolean) {
  const [flow, setFlow] = useState<{
    steps: OnboardingStep[];
    index: number;
  } | null>(null);

  useEffect(() => {
    if (!enabled) return;
    getOnboardingSteps()
      .then((steps) => setFlow({ steps, index: 0 }))
      .catch((err) => {
        // Never block the app on a failed permission check
        log.error('Onboarding check failed', err);
        setFlow({ steps: [], index: 0 });
      });
  }, [enabled]);

  const step = flow?.steps[flow.index] ?? null;

  const advance = () =>
    setFlow((current) =>
      current ? { ...current, index: current.index + 1 } : current,
    );

  const dismiss = () => {
    if (step === 'notifications') dismissNotificationsPrompt();
    if (step === 'battery') dismissBatteryPrompt();
    if (step === 'location') dismissLocationPrompt();
    advance();
  };

  return {
    ready: flow !== null,
    step,
    progress: {
      current: (flow?.index ?? 0) + 1,
      total: flow?.steps.length ?? 0,
    },
    advance,
    dismiss,
  };
}
