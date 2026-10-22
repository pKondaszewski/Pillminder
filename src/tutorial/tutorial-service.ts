import { reminderTexts } from '@/doses/dose-service';
import {
  cancelPracticeReminder,
  getNotificationPermission,
  type NotificationText,
  practiceReminderAt,
  schedulePracticeReminder,
  snoozePracticeReminder,
} from '@/notifications/notification-service';
import { getProductsQuery } from '@/products/product-service';
import {
  getTutorialStep,
  setTutorialStep,
  subscribeToSettings as subscribeToTutorialStep,
  type TutorialStep,
} from '@/settings/settings-service';

import type { PracticeReminder } from './dto/practice-reminder';
import { newestProduct, practiceDose } from './practice-dose';
import { nextTutorialStep, startingTutorialStep } from './tutorial-helper';

export type { PracticeReminder } from './dto/practice-reminder';
export { tutorialFormRoute } from './tutorial-helper';
export { getTutorialStep, subscribeToTutorialStep, type TutorialStep };

// Holds the planned reminder, so a remounted Today does not push it back
let practice: Promise<PracticeReminder | null> | null = null;

export async function resolveTutorialStart(): Promise<void> {
  const stored = getTutorialStep();
  const productCount = (await getProductsQuery()).length;
  setTutorialStep(startingTutorialStep(stored, productCount));
}

export function advanceTutorial(): void {
  changeStep(nextTutorialStep(getTutorialStep()));
}

export function skipTutorial(): void {
  changeStep('done');
}

export function restartTutorial(): void {
  changeStep('intro');
}

export function completePractice(): void {
  if (getTutorialStep() === 'practice') changeStep('done');
}

export async function snoozePractice(texts: NotificationText): Promise<void> {
  if (getTutorialStep() === 'practice') await snoozePracticeReminder(texts);
}

export function startPractice(): Promise<PracticeReminder | null> {
  practice ??= planPractice().catch((error) => {
    practice = null;
    throw error;
  });
  return practice;
}

function changeStep(step: TutorialStep): void {
  const leavesPractice =
    getTutorialStep() === 'practice' && step !== 'practice';
  setTutorialStep(step);
  if (leavesPractice) {
    practice = null;
    void cancelPracticeReminder();
  }
}

async function planPractice(): Promise<PracticeReminder | null> {
  const product = newestProduct(await getProductsQuery());
  if (!product) return null;

  const { granted } = await getNotificationPermission();
  const plannedAt = practiceReminderAt(new Date());
  if (granted) {
    await schedulePracticeReminder(reminderTexts(product, 1).first, plannedAt);
  }
  return { dose: practiceDose(product, plannedAt), notified: granted };
}
