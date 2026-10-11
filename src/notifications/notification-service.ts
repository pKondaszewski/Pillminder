import Constants, { ExecutionEnvironment } from 'expo-constants';
import * as Notifications from 'expo-notifications';

import { createLogger } from '@/config/logger';

import type { DoseReminder } from './dto/dose-reminder';
import type { DoseReminderTexts } from './dto/dose-reminder-texts';
import type { NotificationPermission } from './dto/notification-permission';
import type { NotificationStrings } from './dto/notification-strings';
import type { NotificationText } from './dto/notification-text';
import type { ReminderResponseHandlers } from './dto/reminder-response-handlers';
import type { ReorderAlert } from './dto/reorder-alert';
import {
  ADD_PACK_ACTION,
  BACKGROUND_RESPONSE_TASK,
  BUY_ACTION,
  CATEGORY_ID,
  CHANNEL_ID,
  REORDER_CATEGORY_ID,
  REORDER_CHANNEL_ID,
  REORDER_PACK_CATEGORY_ID,
  SNOOZE_ACTION,
  TAKE_ACTION,
} from './identifiers';
import {
  doseNotificationIdentifiers,
  planDoseNotifications,
} from './reminder-plan';
import { processReminderResponse } from './reminder-response-router';

export type { NotificationPermission } from './dto/notification-permission';
export type { ReminderResponseHandlers } from './dto/reminder-response-handlers';

export const isNotificationsSupported =
  Constants.executionEnvironment !== ExecutionEnvironment.StoreClient;

const log = createLogger('notification-service');

const REORDER_PREFIX = 'reorder:';

let channelSetup: Promise<unknown> = Promise.resolve();

export async function getNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationsSupported) return { granted: true, canAskAgain: false };
  const { granted, canAskAgain } = await Notifications.getPermissionsAsync();
  return { granted, canAskAgain };
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationsSupported) return { granted: true, canAskAgain: false };
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
  texts: DoseReminderTexts,
): Promise<void> {
  if (!isNotificationsSupported) return;

  const planned = planDoseNotifications(
    reminder.id,
    reminder.plannedAt,
    new Date(),
  );
  await Promise.all(
    planned.map(async ({ identifier, kind, at }) => {
      try {
        await Notifications.scheduleNotificationAsync({
          identifier,
          content: {
            title: texts[kind].title,
            body: texts[kind].body,
            categoryIdentifier: CATEGORY_ID,
            data: { doseId: reminder.id },
          },
          trigger: {
            type: Notifications.SchedulableTriggerInputTypes.DATE,
            date: at,
            channelId: CHANNEL_ID,
          },
        });
      } catch (err) {
        log.error(
          `Failed to schedule ${identifier} for dose ${reminder.id}`,
          err,
        );
      }
    }),
  );
}

export async function cancelDoseReminder(doseId: string): Promise<void> {
  if (!isNotificationsSupported) return;
  await forEachDoseNotification(
    doseId,
    'cancel',
    Notifications.cancelScheduledNotificationAsync,
  );
  await dismissDoseReminder(doseId);
}

export async function cancelDoseReminders(doseIds: string[]): Promise<void> {
  await Promise.all(doseIds.map(cancelDoseReminder));
}

export async function scheduleReorderAlert(
  alert: ReorderAlert,
  strings: NotificationText,
): Promise<void> {
  if (!isNotificationsSupported) return;
  if (alert.reorderAt.getTime() <= Date.now()) return;

  try {
    await Notifications.scheduleNotificationAsync({
      identifier: `${REORDER_PREFIX}${alert.productId}`,
      content: {
        title: strings.title,
        body: strings.body,
        categoryIdentifier: alert.canAddPack
          ? REORDER_PACK_CATEGORY_ID
          : REORDER_CATEGORY_ID,
        data: {
          type: 'reorder',
          productId: alert.productId,
          storeLink: alert.storeLink,
        },
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
  if (!isNotificationsSupported) return;
  try {
    const id = `${REORDER_PREFIX}${productId}`;
    await Notifications.cancelScheduledNotificationAsync(id);
    await Notifications.dismissNotificationAsync(id);
  } catch (err) {
    log.warn(`Failed to cancel reorder alert for ${productId}`, err);
  }
}

export async function cancelAllNotifications(): Promise<void> {
  if (!isNotificationsSupported) return;
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.dismissAllNotificationsAsync();
  } catch (err) {
    log.warn('Failed to cancel all notifications', err);
  }
}

export async function dismissDoseReminder(doseId: string): Promise<void> {
  if (!isNotificationsSupported) return;
  await forEachDoseNotification(
    doseId,
    'dismiss',
    Notifications.dismissNotificationAsync,
  );
}

export function subscribeToReminderResponses(
  handlers: ReminderResponseHandlers,
): () => void {
  if (!isNotificationsSupported) return () => {};

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

async function forEachDoseNotification(
  doseId: string,
  actionName: string,
  action: (identifier: string) => Promise<unknown>,
): Promise<void> {
  await Promise.all(
    doseNotificationIdentifiers(doseId).map(async (identifier) => {
      try {
        await action(identifier);
      } catch (err) {
        log.warn(
          `Failed to ${actionName} ${identifier} for dose ${doseId}`,
          err,
        );
      }
    }),
  );
}

async function setUpNotifications(
  strings: NotificationStrings,
): Promise<boolean> {
  if (!isNotificationsSupported) {
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

    await Notifications.setNotificationCategoryAsync(REORDER_PACK_CATEGORY_ID, [
      {
        identifier: BUY_ACTION,
        buttonTitle: strings.buy,
        options: { opensAppToForeground: true },
      },
      {
        identifier: ADD_PACK_ACTION,
        buttonTitle: strings.addPack,
        options: { opensAppToForeground: false },
      },
    ]);

    log.info('Notifications initialized');
    return (await Notifications.getPermissionsAsync()).granted;
  } catch (err) {
    log.error('Failed to initialize notifications', err);
    return false;
  }
}
