import type {
  NotificationResponse,
  NotificationTaskPayload,
} from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { AppState } from 'react-native';

import { createLogger } from '@/config/logger';
import { snoozeDose, takeDose } from '@/doses/dose-service';

import {
  BACKGROUND_RESPONSE_TASK,
  SNOOZE_ACTION,
  TAKE_ACTION,
} from './identifiers';
import { isNotificationsSupported } from './notification-service';

const log = createLogger('background-task');

if (
  isNotificationsSupported &&
  !TaskManager.isTaskDefined(BACKGROUND_RESPONSE_TASK)
) {
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
  if (AppState.currentState === 'active') return;

  const doseId = doseIdOf(response);
  if (!doseId) return;

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

function doseIdOf(response: NotificationResponse): string | undefined {
  const { dataString } = response.notification.request.content as {
    dataString?: string;
  };
  if (!dataString) return undefined;

  try {
    const { doseId } = JSON.parse(dataString);
    return typeof doseId === 'string' ? doseId : undefined;
  } catch (err) {
    log.warn('Failed to parse notification dataString', err);
    return undefined;
  }
}
