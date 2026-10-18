import '@/config/i18n';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { db } from '@/config/db/database';
import { applyStoredTheme } from '@/settings/settings-service';
import { FONT_ASSETS } from '@/ui/commons/constants/fonts';
import { AnimatedSplashOverlay } from '@/ui/components/commons/animated-splash-overlay';
import { MigrationErrorScreen } from '@/ui/components/commons/migration-error-screen';
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

export default function RootLayout() {
  const [attempt, setAttempt] = useState(0);

  // useMigrations runs once per mount, so a new key is what re-runs them
  return (
    <TabLayout
      key={attempt}
      onRerunMigrations={() => setAttempt((n) => n + 1)}
    />
  );
}

function TabLayout({ onRerunMigrations }: { onRerunMigrations: () => void }) {
  const colorScheme = useColorScheme();
  const { success: migrationsReady, error: migrationError } = useMigrations(
    db,
    migrations,
  );
  const [fontsLoaded, fontError] = useFonts(FONT_ASSETS);
  useNotificationSetup();
  const onboarding = useOnboarding(migrationsReady);

  if (migrationError) {
    return (
      <MigrationErrorScreen
        error={migrationError}
        onRerunMigrations={onRerunMigrations}
      />
    );
  }

  // A failed font load falls back to the system font instead of blocking the app
  if (!migrationsReady || !onboarding.ready || !(fontsLoaded || fontError)) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <DatabaseBoundEffects />
        <AnimatedSplashOverlay />
        {onboarding.step ? (
          <OnboardingScreen
            step={onboarding.step}
            onAdvance={onboarding.advance}
            onDismiss={onboarding.dismiss}
          />
        ) : (
          <AppTabs />
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function DatabaseBoundEffects() {
  useReminderResponses();
  useReorderNotifications();
  useDoseSync();
  return null;
}
