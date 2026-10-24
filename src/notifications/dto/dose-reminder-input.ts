import type { DoseReminder } from './dose-reminder';
import type { DoseReminderTexts } from './dose-reminder-texts';

export interface DoseReminderInput {
  reminder: DoseReminder;
  texts: DoseReminderTexts;
}
