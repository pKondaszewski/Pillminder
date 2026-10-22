import type { NotificationText } from './dto/notification-text';

const PRACTICE_DELAY_MS = 60_000;

export const PRACTICE_TYPE = 'practice';

export function practiceReminderAt(now: Date): Date {
  return new Date(now.getTime() + PRACTICE_DELAY_MS);
}

export function isPracticeData(data: Record<string, unknown>): boolean {
  return data.type === PRACTICE_TYPE;
}

export function practiceTexts(content: {
  title: string | null;
  body: string | null;
}): NotificationText {
  return { title: content.title ?? '', body: content.body ?? '' };
}
