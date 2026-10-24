import '@/config/i18n';

import { useMigrations } from 'drizzle-orm/expo-sqlite/migrator';
import { useFonts } from 'expo-font';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router';
import { useState } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import { AppLockScreen } from '@/applock/ui/app-lock-screen';
import { useAppLock } from '@/applock/ui/use-app-lock';
import { AnimatedSplashOverlay } from '@/commons/ui/animated-splash-overlay';
import { FONT_ASSETS } from '@/commons/ui/constants/fonts';
import AppTabs from '@/commons/ui/navigation/app-tabs';
import { db } from '@/config/db/database';
import { useDoseSync } from '@/doses/ui/use-dose-sync';
import { useOrphanedImageCleanup } from '@/images/ui/use-orphaned-image-cleanup';
import { useLocationRefresh } from '@/location/ui/use-location-refresh';
import {
  useNotificationSetup,
  useReminderResponses,
} from '@/notifications/ui/use-notifications';
import { useReorderNotifications } from '@/notifications/ui/use-reorder-notifications';
import { OnboardingScreen } from '@/onboarding/ui/onboarding-screen';
import { useOnboarding } from '@/onboarding/ui/use-onboarding';
import { MigrationErrorScreen } from '@/recovery/ui/migration-error-screen';
import { applyStoredTheme } from '@/settings/settings-service';

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
  const appLock = useAppLock();

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
      <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
        <ThemeProvider
          value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}
        >
          <DatabaseBoundEffects />
          <AnimatedSplashOverlay frozen={appLock.locked} />
          {onboarding.step ? (
            <OnboardingScreen
              step={onboarding.step}
              progress={onboarding.progress}
              onAdvance={onboarding.advance}
              onDismiss={onboarding.dismiss}
            />
          ) : (
            <AppTabs />
          )}
          {appLock.locked ? <AppLockScreen onUnlock={appLock.unlock} /> : null}
        </ThemeProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}

function DatabaseBoundEffects() {
  useReminderResponses();
  useReorderNotifications();
  useDoseSync();
  useLocationRefresh();
  useOrphanedImageCleanup();
  return null;
}
