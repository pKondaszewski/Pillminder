import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import type {
  NotificationResponse,
  NotificationTaskPayload,
} from 'expo-notifications';
import * as TaskManager from 'expo-task-manager';
import { AppState } from 'react-native';

import { db } from '@/config/db/database';
import { createLogger } from '@/config/logger';
import { snoozeDose, syncAllSchedules, takeDose } from '@/doses/dose-service';
import { restockPack } from '@/products/product-orchestrator';

import migrations from '../../drizzle/migrations';
import {
  ADD_PACK_ACTION,
  BACKGROUND_RESPONSE_TASK,
  SNOOZE_ACTION,
  TAKE_ACTION,
} from './identifiers';
import { isNotificationsSupported } from './notification-service';
import { claimResponse } from './reminder-response-router';

const log = createLogger('background-task');

let migrated: Promise<void> | undefined;

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

// Headless launches skip useMigrations in the root layout
function ensureMigrated(): Promise<void> {
  migrated ??= migrate(db, migrations).catch((err: unknown) => {
    migrated = undefined;
    throw err;
  });
  return migrated;
}

async function handleResponse(response: NotificationResponse): Promise<void> {
  if (AppState.currentState === 'active') return;

  try {
    await ensureMigrated();
  } catch (err) {
    log.error('Migrations failed before a background action', err);
    return;
  }

  const { actionIdentifier } = response;
  const payload = payloadOf(response);
  if (actionIdentifier === ADD_PACK_ACTION) {
    const { productId } = payload;
    if (typeof productId === 'string') {
      await addPackFromReorderAlert(response, productId);
    }
    return;
  }

  const doseId = payload.doseId;
  if (typeof doseId !== 'string') return;

  try {
    if (actionIdentifier === TAKE_ACTION) {
      await takeDose(doseId);
    } else if (actionIdentifier === SNOOZE_ACTION) {
      await snoozeDose(doseId);
    }
  } catch (err) {
    log.error(`Background ${actionIdentifier} failed for dose ${doseId}`, err);
  }
  await extendPlanAfterAction(doseId);
}

// The app may never be opened, so nothing else extends the dose plan
async function extendPlanAfterAction(doseId: string): Promise<void> {
  try {
    await syncAllSchedules();
  } catch (err) {
    log.error(`Background dose sync failed after dose ${doseId}`, err);
  }
}

async function addPackFromReorderAlert(
  response: NotificationResponse,
  productId: string,
): Promise<void> {
  if (!claimResponse(response)) return;
  try {
    await restockPack(productId);
  } catch (err) {
    log.error(`Background add pack failed for product ${productId}`, err);
  }
}

function payloadOf(response: NotificationResponse): Record<string, unknown> {
  const { dataString } = response.notification.request.content as {
    dataString?: string;
  };
  if (!dataString) return {};

  try {
    return JSON.parse(dataString) ?? {};
  } catch (err) {
    log.warn('Failed to parse notification dataString', err);
    return {};
  }
}
