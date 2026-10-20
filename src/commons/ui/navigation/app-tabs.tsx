import { type MaterialTopTabBarProps, TopTabs } from 'expo-router/js-top-tabs';
import { useTranslation } from 'react-i18next';

import { AppTabBar } from '@/commons/ui/navigation/app-tab-bar';

export default function AppTabs() {
  const { t } = useTranslation();

  return (
    <TopTabs
      tabBarPosition="bottom"
      tabBar={(props: MaterialTopTabBarProps) => <AppTabBar {...props} />}
      screenOptions={{ swipeEnabled: true, lazy: true }}
    >
      <TopTabs.Screen name="(today)" options={{ title: t('tabs.home') }} />
      <TopTabs.Screen
        name="(products)"
        options={{ title: t('tabs.products') }}
      />
      <TopTabs.Screen name="(plan)" options={{ title: t('tabs.plan') }} />
      <TopTabs.Screen
        name="(settings)"
        options={{ title: t('tabs.settings') }}
      />
    </TopTabs>
  );
}
