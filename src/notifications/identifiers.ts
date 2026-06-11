// Leaf module: notification identifiers shared by the service and the
// background task. Kept import-free so both can depend on it without a cycle.

export const CHANNEL_ID = 'dose-reminders-v2';
export const CATEGORY_ID = 'dose-reminder';
export const TAKE_ACTION = 'TAKE_ACTION';
export const SNOOZE_ACTION = 'SNOOZE_ACTION';

export const REORDER_CHANNEL_ID = 'reorder-alerts-v1';
export const REORDER_CATEGORY_ID = 'reorder-alert';
export const BUY_ACTION = 'BUY_ACTION';

export const BACKGROUND_RESPONSE_TASK = 'dose-reminder-response';
