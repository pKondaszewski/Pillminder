import { Stack } from 'expo-router';

export const unstable_settings = {
  today: { anchor: 'index' },
  products: { anchor: 'products/index' },
  plan: { anchor: 'schedules/index' },
  settings: { anchor: 'settings' },
};

export default function TabStackLayout() {
  return <Stack screenOptions={{ headerShown: false }} />;
}
