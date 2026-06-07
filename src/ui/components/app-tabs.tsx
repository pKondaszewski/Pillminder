import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useTranslation } from 'react-i18next';
import { useColorScheme } from 'react-native';

import { Colors } from '@/ui/constants/theme';

export default function AppTabs() {
  const { t } = useTranslation();
  const scheme = useColorScheme();
  const colors = Colors[scheme === 'unspecified' ? 'light' : scheme];

  return (
    <NativeTabs
      backgroundColor={colors.background}
      indicatorColor={colors.backgroundElement}
      labelStyle={{ selected: { color: colors.text } }}
    >
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          {t('tabs.products')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="pills.fill" md="medication" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="schedules">
        <NativeTabs.Trigger.Label>
          {t('tabs.schedules')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="calendar.badge.clock" md="event" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
