import Constants, { ExecutionEnvironment } from 'expo-constants';
import type {
  NotificationResponse,
  NotificationTaskPayload,
} from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { AppState, Platform } from 'react-native';

import { createLogger } from '@/config/logger';
import { snoozeDose, takeDose } from '@/doses/dose-service';

import {
  BACKGROUND_RESPONSE_TASK,
  SNOOZE_ACTION,
  TAKE_ACTION,
} from './identifiers';

// Side-effect module: defines the headless task that applies Taken/Snooze while
// the app is killed (Android). Must be evaluated in module scope of an early
// import so the OS can find the task on a headless launch — see src/app/_layout.
// Registration (registerTaskAsync) happens in notification-service.initNotifications.

const log = createLogger('background-task');

const isExpoGo =
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;
const isSupported = Platform.OS === 'android' && !isExpoGo;

if (isSupported && !TaskManager.isTaskDefined(BACKGROUND_RESPONSE_TASK)) {
  TaskManager.defineTask<NotificationTaskPayload>(
    BACKGROUND_RESPONSE_TASK,
    async ({ data, error }) => {
      if (error) {
        log.error('Background notification task error', error);
        return;
      }
      if (!data || !('actionIdentifier' in data)) return;
      await handleResponse(data as NotificationResponse);
    },
  );
}

async function handleResponse(response: NotificationResponse): Promise<void> {
  // When the app is alive the in-app listener already handles the response;
  // bail so we don't apply it twice.
  if (AppState.currentState === 'active') return;

  const doseId = response.notification.request.content.data?.doseId;
  if (typeof doseId !== 'string') return;

  const { actionIdentifier } = response;
  try {
    if (actionIdentifier === TAKE_ACTION) {
      await takeDose(doseId);
    } else if (actionIdentifier === SNOOZE_ACTION) {
      await snoozeDose(doseId);
    }
  } catch (err) {
    log.error(`Background ${actionIdentifier} failed for dose ${doseId}`, err);
  }
}
