import { router } from 'expo-router';
import { useEffect, useRef, useState, useSyncExternalStore } from 'react';

import { createLogger } from '@/config/logger';
import {
  advanceTutorial,
  completePractice,
  getTutorialStep,
  type PracticeReminder,
  resolveTutorialStart,
  skipTutorial,
  startPractice,
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

  return {
    step,
    advance: advanceTutorial,
    skip: skipTutorial,
    skipAndGoHome,
    completePractice,
  };
}

function skipAndGoHome(): void {
  skipTutorial();
  router.navigate('/');
}

export function usePracticeReminder(active: boolean): PracticeReminder | null {
  const [reminder, setReminder] = useState<PracticeReminder | null>(null);

  useEffect(() => {
    if (!active) return;
    startPractice()
      .then(setReminder)
      .catch((err) => log.error('Practice reminder failed', err));
  }, [active]);

  return active ? reminder : null;
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
