import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { NotificationResponse } from 'expo-notifications';
import { Platform } from 'react-native';

import { createLogger } from '@/config/logger';

import type { DoseReminder } from './dto/dose-reminder';
import type { DoseReminderStrings } from './dto/dose-reminder-strings';
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

export type { DoseReminder } from './dto/dose-reminder';
export type { DoseReminderStrings } from './dto/dose-reminder-strings';
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

export const SNOOZE_MINUTES = 10;

const REORDER_PREFIX = 'reorder:';

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isSupported = Platform.OS !== 'web' && !isExpoGo;

type NotificationsModule = typeof import('expo-notifications');
let modulePromise: Promise<NotificationsModule> | null = null;

const handledResponses = new Set<string>();

function loadNotifications(): Promise<NotificationsModule> {
  if (!modulePromise) {
    modulePromise = import('expo-notifications');
  }
  return modulePromise;
}

export async function initNotifications(
  strings: DoseReminderStrings & { buy: string; reorderChannel: string },
): Promise<boolean> {
  if (!isSupported) {
    log.info('Notifications unsupported in this environment, skipping init');
    return false;
  }

  try {
    const Notifications = await loadNotifications();

    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowBanner: true,
        shouldShowList: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    const { status } = await Notifications.getPermissionsAsync();
    const granted =
      status === 'granted'
        ? true
        : (await Notifications.requestPermissionsAsync()).status === 'granted';

    if (!granted) {
      log.warn('Notification permission not granted');
      return false;
    }

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

    // Android only: lets Taken/Snooze run while the app is killed. iOS does not
    // deliver action responses to background tasks, so the in-app listener
    // (subscribeToReminderResponses) covers it there.
    if (Platform.OS === 'android') {
      try {
        await Notifications.registerTaskAsync(BACKGROUND_RESPONSE_TASK);
      } catch (err) {
        log.warn('Failed to register background response task', err);
      }
    }

    log.info('Notifications initialized');
    return true;
  } catch (err) {
    log.error('Failed to initialize notifications', err);
    return false;
  }
}

export async function scheduleDoseReminder(
  reminder: DoseReminder,
  strings: Pick<DoseReminderStrings, 'title' | 'body'>,
): Promise<void> {
  if (!isSupported) return;
  if (reminder.plannedAt.getTime() <= Date.now()) return;

  try {
    const Notifications = await loadNotifications();
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
    const Notifications = await loadNotifications();
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
    const Notifications = await loadNotifications();
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
    const Notifications = await loadNotifications();
    await Notifications.cancelScheduledNotificationAsync(
      `${REORDER_PREFIX}${productId}`,
    );
  } catch (err) {
    log.warn(`Failed to cancel reorder alert for ${productId}`, err);
  }
}

export async function dismissDoseReminder(doseId: string): Promise<void> {
  if (!isSupported) return;
  try {
    const Notifications = await loadNotifications();
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
    const Notifications = await loadNotifications();

    const handle = (response: NotificationResponse) => {
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

function processReminderResponse(
  response: NotificationResponse,
  handlers: ReminderResponseHandlers,
): boolean {
  const data = response.notification.request.content.data ?? {};
  return data.type === 'reorder'
    ? processReorderResponse(response, data, handlers)
    : processDoseResponse(response, data, handlers);
}

function processReorderResponse(
  response: NotificationResponse,
  data: Record<string, unknown>,
  handlers: ReminderResponseHandlers,
): boolean {
  if (response.actionIdentifier !== BUY_ACTION) return false;
  const storeLink = typeof data.storeLink === 'string' ? data.storeLink : null;
  return runHandlerOnce(responseKey(response), () =>
    handlers.onReorder(storeLink),
  );
}

function processDoseResponse(
  response: NotificationResponse,
  data: Record<string, unknown>,
  handlers: ReminderResponseHandlers,
): boolean {
  const doseId = data.doseId;
  if (typeof doseId !== 'string') return false;

  if (response.actionIdentifier === TAKE_ACTION) {
    return runHandlerOnce(responseKey(response), () => handlers.onTake(doseId));
  }
  if (response.actionIdentifier === SNOOZE_ACTION) {
    return runHandlerOnce(responseKey(response), () =>
      handlers.onSnooze(doseId),
    );
  }
  return false;
}

function responseKey(response: NotificationResponse): string {
  return `${response.notification.request.identifier}:${response.actionIdentifier}`;
}

function runHandlerOnce(key: string, action: () => void): boolean {
  if (handledResponses.has(key)) return false;
  handledResponses.add(key);
  action();
  return true;
}
