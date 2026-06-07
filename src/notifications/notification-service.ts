import Constants, { ExecutionEnvironment } from 'expo-constants';
import type { NotificationResponse } from 'expo-notifications';
import { Platform } from 'react-native';

import { createLogger } from '@/config/logger';

import type { DoseReminder } from './dto/dose-reminder';
import type { DoseReminderStrings } from './dto/dose-reminder-strings';

export type { DoseReminder } from './dto/dose-reminder';
export type { DoseReminderStrings } from './dto/dose-reminder-strings';

const log = createLogger('notification-service');

export const CHANNEL_ID = 'dose-reminders-v2';
export const CATEGORY_ID = 'dose-reminder';
export const TAKE_ACTION = 'TAKE_ACTION';
export const SNOOZE_ACTION = 'SNOOZE_ACTION';
export const SNOOZE_MINUTES = 10;

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

export interface ReminderResponseHandlers {
  onTake: (doseId: string) => void;
  onSnooze: (doseId: string) => void;
}

export async function initNotifications(
  strings: DoseReminderStrings,
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
    }

    await Notifications.setNotificationCategoryAsync(CATEGORY_ID, [
      {
        identifier: TAKE_ACTION,
        buttonTitle: strings.take,
        options: { opensAppToForeground: true },
      },
      {
        identifier: SNOOZE_ACTION,
        buttonTitle: strings.snooze,
        options: { opensAppToForeground: true },
      },
    ]);

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

function processReminderResponse(
  response: NotificationResponse,
  handlers: ReminderResponseHandlers,
): void {
  const doseId = response.notification.request.content.data?.doseId;
  if (typeof doseId !== 'string') return;

  const key = `${response.notification.request.identifier}:${response.actionIdentifier}`;
  if (handledResponses.has(key)) return;
  handledResponses.add(key);

  if (response.actionIdentifier === TAKE_ACTION) {
    handlers.onTake(doseId);
  } else if (response.actionIdentifier === SNOOZE_ACTION) {
    handlers.onSnooze(doseId);
  }
}

export async function subscribeToReminderResponses(
  handlers: ReminderResponseHandlers,
): Promise<() => void> {
  if (!isSupported) return () => {};

  try {
    const Notifications = await loadNotifications();
    const subscription = Notifications.addNotificationResponseReceivedListener(
      (response) => processReminderResponse(response, handlers),
    );

    const launchResponse = Notifications.getLastNotificationResponse();
    if (launchResponse) {
      processReminderResponse(launchResponse, handlers);
    }

    return () => subscription.remove();
  } catch (err) {
    log.error('Failed to subscribe to reminder responses', err);
    return () => {};
  }
}
