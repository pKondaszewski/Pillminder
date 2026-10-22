import type { TutorialStep } from '@/settings/settings-service';

export function startingTutorialStep(
  stored: TutorialStep,
  productCount: number,
): TutorialStep {
  return stored === 'intro' && productCount > 0 ? 'done' : stored;
}

export function nextTutorialStep(step: TutorialStep): TutorialStep {
  return NEXT_STEP[step];
}

export function tutorialFormRoute(
  step: TutorialStep,
): '/products/new' | '/schedules/new' | null {
  return FORM_ROUTES[step] ?? null;
}

const FORM_ROUTES: Partial<
  Record<TutorialStep, '/products/new' | '/schedules/new'>
> = {
  product: '/products/new',
  schedule: '/schedules/new',
};

const NEXT_STEP: Record<TutorialStep, TutorialStep> = {
  intro: 'product',
  product: 'schedule',
  schedule: 'practice',
  practice: 'done',
  done: 'done',
};
