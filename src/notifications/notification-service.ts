import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import { createLogger } from '@/config/logger';

import type { DoseReminder } from './dto/dose-reminder';
import type { DoseReminderStrings } from './dto/dose-reminder-strings';
import type { NotificationPermission } from './dto/notification-permission';
import type { ReminderResponseHandlers } from './dto/reminder-response-handlers';
import type { ReorderAlert } from './dto/reorder-alert';
import {
  BACKGROUND_RESPONSE_TASK,
  BUY_ACTION,
  CATEGORY_ID,
  CHANNEL_ID,
  REORDER_CATEGORY_ID,
  REORDER_CHANNEL_ID,
  SNOOZE_ACTION,
  TAKE_ACTION,
} from './identifiers';
import { processReminderResponse } from './reminder-response-router';

export type { DoseReminder } from './dto/dose-reminder';
export type { DoseReminderStrings } from './dto/dose-reminder-strings';
export type { NotificationPermission } from './dto/notification-permission';
export type { ReminderResponseHandlers } from './dto/reminder-response-handlers';
export type { ReorderAlert } from './dto/reorder-alert';
export {
  BUY_ACTION,
  CATEGORY_ID,
  CHANNEL_ID,
  REORDER_CATEGORY_ID,
  REORDER_CHANNEL_ID,
  SNOOZE_ACTION,
  TAKE_ACTION,
} from './identifiers';

const log = createLogger('notification-service');

const REORDER_PREFIX = 'reorder:';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isSupported = Platform.OS !== 'web' && !isExpoGo;

let channelSetup: Promise<unknown> = Promise.resolve();

export type NotificationStrings = Omit<DoseReminderStrings, 'body'> & {
  buy: string;
  reorderChannel: string;
};

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!isSupported) return { granted: true, canAskAgain: false };
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  return { granted, canAskAgain };
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isSupported) return { granted: true, canAskAgain: false };
  // Android 13+ shows the system prompt only once a notification channel exists
  await channelSetup;
  const { granted, canAskAgain } =
    await Notifications.requestPermissionsAsync();
  return { granted, canAskAgain };
}

export function initNotifications(
  strings: NotificationStrings,
): Promise<boolean> {
  const setup = setUpNotifications(strings);
  channelSetup = setup;
  return setup;
}

export async function scheduleDoseReminder(
  reminder: DoseReminder,
  strings: Pick<DoseReminderStrings, 'title' | 'body'>,
): Promise<void> {
  if (!isSupported) return;
  if (reminder.plannedAt.getTime() <= Date.now()) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: reminder.id,
      content: {
        title: strings.title,
        body: strings.body,
        categoryIdentifier: CATEGORY_ID,
        data: { doseId: reminder.id },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminder.plannedAt,
        channelId: CHANNEL_ID,
      },
    });
  } catch (err) {
    log.error(`Failed to schedule reminder for dose ${reminder.id}`, err);
  }
}

export async function cancelDoseReminder(doseId: string): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(doseId);
  } catch (err) {
    log.warn(`Failed to cancel reminder for dose ${doseId}`, err);
  }
}

export async function cancelDoseReminders(doseIds: string[]): Promise<void> {
  await Promise.all(doseIds.map(cancelDoseReminder));
}

export async function scheduleReorderAlert(
  alert: ReorderAlert,
  strings: { title: string; body: string },
): Promise<void> {
  if (!isSupported) return;
  if (alert.reorderAt.getTime() <= Date.now()) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: `${REORDER_PREFIX}${alert.productId}`,
      content: {
        title: strings.title,
        body: strings.body,
        categoryIdentifier: REORDER_CATEGORY_ID,
        data: { type: 'reorder', storeLink: alert.storeLink },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: alert.reorderAt,
        channelId: REORDER_CHANNEL_ID,
      },
    });
  } catch (err) {
    log.error(`Failed to schedule reorder alert for ${alert.productId}`, err);
  }
}

export async function cancelReorderAlert(productId: string): Promise<void> {
  if (!isSupported) return;
  try {
    const id = `${REORDER_PREFIX}${productId}`;
    await Notifications.cancelScheduledNotificationAsync(id);
    await Notifications.dismissNotificationAsync(id);
  } catch (err) {
    log.warn(`Failed to cancel reorder alert for ${productId}`, err);
  }
}

export async function dismissDoseReminder(doseId: string): Promise<void> {
  if (!isSupported) return;
  try {
    await Notifications.dismissNotificationAsync(doseId);
  } catch (err) {
    log.warn(`Failed to dismiss delivered reminder for dose ${doseId}`, err);
  }
}

export async function subscribeToReminderResponses(
  handlers: ReminderResponseHandlers,
): Promise<() => void> {
  if (!isSupported) return () => {};

  try {
    const handle = (response: Notifications.NotificationResponse) => {
      if (!processReminderResponse(response, handlers)) return;
      void Notifications.dismissNotificationAsync(
        response.notification.request.identifier,
      );
    };

    const subscription =
      Notifications.addNotificationResponseReceivedListener(handle);

    const launchResponse = Notifications.getLastNotificationResponse();
    if (launchResponse) {
      handle(launchResponse);
    }

    return () => subscription.remove();
  } catch (err) {
    log.error('Failed to subscribe to reminder responses', err);
    return () => {};
  }
}

async function setUpNotifications(
  strings: NotificationStrings,
): Promise<boolean> {
  if (!isSupported) {
    log.info('Notifications unsupported in this environment, skipping init');
    return false;
  }

  try {
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
        name: strings.title,
        importance: Notifications.AndroidImportance.HIGH,
        sound: 'default',
        enableVibrate: true,
        vibrationPattern: [0, 250, 250, 250],
      });
      await Notifications.setNotificationChannelAsync(REORDER_CHANNEL_ID, {
        name: strings.reorderChannel,
        importance: Notifications.AndroidImportance.DEFAULT,
      });
      try {
        await Notifications.registerTaskAsync(BACKGROUND_RESPONSE_TASK);
      } catch (err) {
        log.warn('Failed to register background response task', err);
      }
    }

    await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
      {
        identifier: TAKE_ACTION,
        buttonTitle: strings.take,
        options: { opensAppToForeground: false },
      },
      {
        identifier: SNOOZE_ACTION,
        buttonTitle: strings.snooze,
        options: { opensAppToForeground: false },
      },
    ]);

    await Notifications.setNotificationCategoryAsync(REORDER_CATEGORY_ID, [
      {
        identifier: BUY_ACTION,
        buttonTitle: strings.buy,
        options: { opensAppToForeground: true },
      },
    ]);

    log.info('Notifications initialized');
    return (await Notifications.getPermissionsAsync()).granted;
  } catch (err) {
    log.error('Failed to initialize notifications', err);
    return false;
  }
}
