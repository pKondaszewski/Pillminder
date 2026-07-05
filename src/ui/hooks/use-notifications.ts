import { useEffect } from 'react';
import { Linking } from 'react-native';

import i18n from '@/config/i18n';
import { createLogger } from '@/config/logger';
import { snoozeDose, takeDose } from '@/doses/dose-service';
import {
  initNotifications,
  subscribeToReminderResponses,
} from '@/notifications/notification-service';

const log = createLogger('use-notifications');

export function useNotifications() {
  useEffect(() => {
    const ready = startNotifications();
    return () => {
      void ready.then((unsubscribe) => unsubscribe());
    };
  }, []);
}

async function startNotifications(): Promise<() => void> {
  await initNotifications({
    title: i18n.t('notification.title'),
    take: i18n.t('notification.take'),
    snooze: i18n.t('notification.snooze'),
    buy: i18n.t('notification.buy'),
    reorderChannel: i18n.t('notification.reorderTitle'),
  });

  return subscribeToReminderResponses({
    onTake: (doseId) =>
      takeDose(doseId).catch((err) =>
        log.error('Take from notification failed', err),
      ),
    onSnooze: (doseId) =>
      snoozeDose(doseId).catch((err) =>
        log.error('Snooze from notification failed', err),
      ),
    onReorder: (storeLink) => {
      if (!storeLink) return;
      Linking.openURL(storeLink).catch((err) =>
        log.error('Open store link from notification failed', err),
      );
    },
  });
}
