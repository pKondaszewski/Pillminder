import '@/config/i18n';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { Text, useColorScheme, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { db } from '@/config/db/database';
import { applyStoredTheme } from '@/settings/settings-service';
import { AnimatedSplashOverlay } from '@/ui/components/commons/animated-icon';
import AppTabs from '@/ui/components/navigation/app-tabs';
import { OnboardingScreen } from '@/ui/components/onboarding/onboarding-screen';
import { useDoseSync } from '@/ui/hooks/use-dose-sync';
import {
  useNotificationSetup,
  useReminderResponses,
} from '@/ui/hooks/use-notifications';
import { useOnboarding } from '@/ui/hooks/use-onboarding';
import { useReorderNotifications } from '@/ui/hooks/use-reorder-notifications';

import migrations from '../../drizzle/migrations';

applyStoredTheme();

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { success: migrationsReady, error: migrationError } = useMigrations(
    db,
    migrations,
  );
  useNotificationSetup();
  const onboarding = useOnboarding(migrationsReady);

  if (migrationError) {
    return <MigrationErrorScreen error={migrationError} />;
  }

  if (!migrationsReady || !onboarding.ready) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <DatabaseBoundEffects />
        <AnimatedSplashOverlay />
        {onboarding.visible ? (
          <OnboardingScreen
            onFinish={onboarding.finish}
            onDismiss={onboarding.dismiss}
          />
        ) : (
          <AppTabs />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function MigrationErrorScreen({ error }: { error: Error }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <Text>Migration error: {error.message}</Text>
    </View>
  );
}

function DatabaseBoundEffects() {
  useReminderResponses();
  useReorderNotifications();
  useDoseSync();
  return null;
}
