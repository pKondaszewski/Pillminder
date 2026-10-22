import { getProductsQuery } from '@/products/product-service';
import {
  getTutorialStep,
  setTutorialStep,
  subscribeToSettings as subscribeToTutorialStep,
  type TutorialStep,
} from '@/settings/settings-service';

import { nextTutorialStep, startingTutorialStep } from './tutorial-helper';

export { tutorialFormRoute } from './tutorial-helper';

export { getTutorialStep, subscribeToTutorialStep, type TutorialStep };

export async function resolveTutorialStart(): Promise<void> {
  const stored = getTutorialStep();
  const productCount = (await getProductsQuery()).length;
  setTutorialStep(startingTutorialStep(stored, productCount));
}

export function advanceTutorial(): void {
  setTutorialStep(nextTutorialStep(getTutorialStep()));
}

export function skipTutorial(): void {
  setTutorialStep('done');
}

export function restartTutorial(): void {
  setTutorialStep('intro');
}
