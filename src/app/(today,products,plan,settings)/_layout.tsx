import { Stack, useNavigation } from 'expo-router';

export const unstable_settings = {
  today: { anchor: 'index' },
  products: { anchor: 'products/index' },
  plan: { anchor: 'schedules/index' },
  settings: { anchor: 'settings' },
};

export default function TabStackLayout() {
  const tab = useNavigation();

  return (
    <Stack
      screenOptions={{ headerShown: false }}
      screenListeners={{
        state: ({ data }) => {
          // Pages of the tab pager must not swipe while a pushed screen is on top
          tab.setOptions({ swipeEnabled: data.state.routes.length === 1 });
        },
      }}
    />
  );
}
