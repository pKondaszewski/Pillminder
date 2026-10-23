import type { NotificationText } from './notification-text';

export interface ReminderResponseHandlers {
  onTake: (doseId: string) => void;
  onSnooze: (doseId: string) => void;
  onPracticeTake: () => void;
  onPracticeSnooze: (text: NotificationText) => void;
  onReorder: (productId: string) => void;
  onAddPack: (productId: string) => void;
}
