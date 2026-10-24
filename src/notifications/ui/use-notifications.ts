import { router } from 'expo-router';
import { useEffect } from 'react';

import i18n from '@/config/i18n';
import { createLogger } from '@/config/logger';
import {
  refreshAllReminders,
  snoozeDose,
  takeDose,
} from '@/doses/dose-service';
import {
  initNotifications,
  type ReminderResponseHandlers,
  subscribeToReminderResponses,
} from '@/notifications/notification-service';
import { restockPack } from '@/products/product-orchestrator';

const log = createLogger('use-notifications');

export function useNotificationSetup() {
  useEffect(() => {
    void initNotificationStrings();
    const refreshOnLanguageChange = () => {
      void refreshNotificationLanguage();
    };
    i18n.on('languageChanged', refreshOnLanguageChange);
    return () => i18n.off('languageChanged', refreshOnLanguageChange);
  }, []);
}

export function useReminderResponses() {
  useEffect(() => subscribeToReminderResponses(responseHandlers), []);
}

function initNotificationStrings() {
  return initNotifications({
    title: i18n.t('notification.title'),
    take: i18n.t('notification.take'),
    snooze: i18n.t('notification.snooze'),
    buy: i18n.t('notification.buy'),
    addPack: i18n.t('notification.addPack'),
    reorderChannel: i18n.t('notification.reorderTitle'),
  });
}

async function refreshNotificationLanguage(): Promise<void> {
  try {
    await initNotificationStrings();
    await refreshAllReminders();
  } catch (err) {
    log.error('Refreshing notifications after language change failed', err);
  }
}

const responseHandlers: ReminderResponseHandlers = {
  onTake: (doseId) =>
    takeDose(doseId).catch((err) =>
      log.error('Take from notification failed', err),
    ),
  onSnooze: (doseId) =>
    snoozeDose(doseId).catch((err) =>
      log.error('Snooze from notification failed', err),
    ),
  // The product screen opens the store, or asks where to when nothing is remembered
  onReorder: (productId) =>
    router.navigate({
      pathname: '/products/[id]',
      params: { id: productId, buy: '1' },
    }),
  onAddPack: (productId) =>
    restockPack(productId).catch((err) =>
      log.error('Add pack from notification failed', err),
    ),
};
