import type { NotificationResponse } from 'expo-notifications';

import type { ReminderResponseHandlers } from './dto/reminder-response-handlers';
import { BUY_ACTION, SNOOZE_ACTION, TAKE_ACTION } from './identifiers';

const handledResponses = new Set<string>();

export function processReminderResponse(
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
