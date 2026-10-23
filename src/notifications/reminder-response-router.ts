import type { NotificationResponse } from 'expo-notifications';

import type { ReminderResponseHandlers } from './dto/reminder-response-handlers';
import {
  ADD_PACK_ACTION,
  BUY_ACTION,
  SNOOZE_ACTION,
  TAKE_ACTION,
} from './identifiers';
import { isPracticeData, practiceTexts } from './practice-reminder';

const handledResponses = new Set<string>();

// The app listener and the background task can both see one response when the
// app is alive in the background; adding a pack is not idempotent. The delivery
// date is in the key because the practice reminder reuses one identifier.
export function claimResponse(response: NotificationResponse): boolean {
  const key = responseKey(response);
  if (handledResponses.has(key)) return false;
  handledResponses.add(key);
  return true;
}

export function processReminderResponse(
  response: NotificationResponse,
  handlers: ReminderResponseHandlers,
): boolean {
  const data = response.notification.request.content.data ?? {};
  if (data.type === 'reorder') {
    return processReorderResponse(response, data, handlers);
  }
  return isPracticeData(data)
    ? processPracticeResponse(response, handlers)
    : processDoseResponse(response, data, handlers);
}

function processPracticeResponse(
  response: NotificationResponse,
  handlers: ReminderResponseHandlers,
): boolean {
  if (response.actionIdentifier === TAKE_ACTION) {
    return runHandlerOnce(response, handlers.onPracticeTake);
  }
  if (response.actionIdentifier !== SNOOZE_ACTION) return false;
  const texts = practiceTexts(response.notification.request.content);
  return runHandlerOnce(response, () => handlers.onPracticeSnooze(texts));
}

function processReorderResponse(
  response: NotificationResponse,
  data: Record<string, unknown>,
  handlers: ReminderResponseHandlers,
): boolean {
  const { productId } = data;
  if (typeof productId !== 'string') return false;
  if (response.actionIdentifier === ADD_PACK_ACTION) {
    return runHandlerOnce(response, () => handlers.onAddPack(productId));
  }
  if (response.actionIdentifier !== BUY_ACTION) return false;
  return runHandlerOnce(response, () => handlers.onReorder(productId));
}

function processDoseResponse(
  response: NotificationResponse,
  data: Record<string, unknown>,
  handlers: ReminderResponseHandlers,
): boolean {
  const doseId = data.doseId;
  if (typeof doseId !== 'string') return false;

  if (response.actionIdentifier === TAKE_ACTION) {
    return runHandlerOnce(response, () => handlers.onTake(doseId));
  }
  if (response.actionIdentifier === SNOOZE_ACTION) {
    return runHandlerOnce(response, () => handlers.onSnooze(doseId));
  }
  return false;
}

function responseKey(response: NotificationResponse): string {
  const { identifier } = response.notification.request;
  return `${identifier}:${response.notification.date}:${response.actionIdentifier}`;
}

function runHandlerOnce(
  response: NotificationResponse,
  action: () => void,
): boolean {
  if (!claimResponse(response)) return false;
  action();
  return true;
}
