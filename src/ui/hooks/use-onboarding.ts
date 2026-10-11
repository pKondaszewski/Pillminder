import { useEffect, useState } from 'react';

import { createLogger } from '@/config/logger';
import {
  dismissNotificationsPrompt,
  shouldShowOnboarding,
} from '@/onboarding/onboarding-service';

const log = createLogger('use-onboarding');

export function useOnboarding(enabled: boolean) {
  const [visible, setVisible] = useState<boolean | null>(null);

  useEffect(() => {
    if (!enabled) return;
    shouldShowOnboarding()
      .then(setVisible)
      .catch((err) => {
        // Never block the app on a failed permission check
        log.error('Onboarding check failed', err);
        setVisible(false);
      });
  }, [enabled]);

  const finish = () => setVisible(false);

  const dismiss = () => {
    dismissNotificationsPrompt();
    setVisible(false);
  };

  return {
    ready: visible !== null,
    visible: visible === true,
    finish,
    dismiss,
  };
}
