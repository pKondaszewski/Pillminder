import { router } from 'expo-router';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { createLogger } from '@/config/logger';
import {
  advanceTutorial,
  getTutorialStep,
  resolveTutorialStart,
  skipTutorial,
  subscribeToTutorialStep,
  tutorialFormRoute,
  type TutorialStep,
} from '@/tutorial/tutorial-service';

const log = createLogger('use-tutorial');

export function useTutorialStart(enabled: boolean): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    resolveTutorialStart()
      .catch((err) => log.error('Tutorial check failed', err))
      .finally(() => setReady(true));
  }, [enabled]);

  return ready;
}

export function useTutorial() {
  const step = useSyncExternalStore(subscribeToTutorialStep, getTutorialStep);

  return { step, advance: advanceTutorial, skip: skipTutorial };
}

export function useTutorialFormPrompt(step: TutorialStep): void {
  const lastStep = useRef<TutorialStep | null>(null);

  useEffect(() => {
    const route = tutorialFormRoute(step);
    if (!route || lastStep.current === step) return;
    // a later step in the same session is reached from the open form, which navigates itself
    const continuesFlow = lastStep.current !== null;
    lastStep.current = step;
    if (!continuesFlow) router.push(route);
  }, [step]);
}
