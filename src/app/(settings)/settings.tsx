import Constants from 'expo-constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useAppLockSetting } from '@/applock/ui/use-app-lock-setting';
import { useBatteryOptimization } from '@/battery/ui/use-battery-optimization';
import { Spacing } from '@/commons/ui/constants/theme';
import { FieldRow } from '@/commons/ui/field-row';
import { ScreenTitle } from '@/commons/ui/screen-title';
import { SegmentedControl } from '@/commons/ui/segmented-control';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import { AUTHOR_NAME } from '@/config/app-info';
import { useLocationPermission } from '@/location/ui/use-location-permission';
import { useNotificationPermission } from '@/notifications/ui/use-notification-permission';
import { permissionStep } from '@/onboarding/onboarding-service';
import {
  LANGUAGE_OPTIONS,
  type LanguagePreference,
  SEASON_OPTIONS,
  type SeasonPreference,
  THEME_OPTIONS,
  type ThemePreference,
} from '@/settings/settings-service';
import {
  setLanguage,
  setSeasonPreference,
  setSnoozeMinutes,
  setTheme,
} from '@/settings/settings-service';
import { AboutLine } from '@/settings/ui/about-line';
import { AppLockSection } from '@/settings/ui/app-lock-section';
import { SettingsSection } from '@/settings/ui/settings-section';
import { SnoozeSheet } from '@/settings/ui/snooze-sheet';
import { StatusCard } from '@/settings/ui/status-card';
import {
  batteryCardState,
  locationCardState,
  notificationCardState,
} from '@/settings/ui/status-card-state';
import { useSettings } from '@/settings/ui/use-settings';

type Sheet = 'snooze';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const settings = useSettings();
  const { permission, request } = useNotificationPermission();
  const battery = useBatteryOptimization();
  const location = useLocationPermission();
  const appLock = useAppLockSetting();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const { snackbar, runWithUndo } = useUndoSnackbar();

  const notifications = permission
    ? notificationCardState(permissionStep(permission))
    : null;
  const batteryState =
    battery.enabled === null ? null : batteryCardState(battery.enabled);
  const notificationsFix =
    notifications?.fix === 'request'
      ? request
      : notifications?.fix === 'openSettings'
        ? () => void Linking.openSettings()
        : undefined;
  const locationState = location.permission
    ? locationCardState(
        permissionStep(location.permission),
        settings.location !== null,
      )
    : null;
  const locationActions = {
    enable: () => void location.enable(),
    disable: location.disable,
    openSettings: () => void Linking.openSettings(),
  };
  const closeSheet = () => setSheet(null);

  return (
    <>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView contentContainerStyle={styles.content}>
            <ScreenTitle title={t('tabs.settings')} />

            <SettingsSection title={t('settings.permissions')}>
              {notifications ? (
                <StatusCard
                  ok={notifications.ok}
                  title={t('settings.notificationsPermission')}
                  status={t(notifications.statusKey)}
                  fixLabel={t('settings.fix')}
                  onFix={notificationsFix}
                />
              ) : null}
              {batteryState ? (
                <StatusCard
                  ok={batteryState.ok}
                  title={t('settings.batteryOptimization')}
                  status={t(batteryState.statusKey)}
                  fixLabel={t('settings.fix')}
                  onFix={
                    batteryState.ok
                      ? undefined
                      : () => void battery.openSettings()
                  }
                />
              ) : null}
              {locationState ? (
                <StatusCard
                  ok={locationState.ok}
                  neutral={locationState.neutral}
                  title={t('settings.locationPermission')}
                  status={t(locationState.statusKey)}
                  fixLabel={t(locationState.actionKey)}
                  onFix={locationActions[locationState.action]}
                />
              ) : null}
            </SettingsSection>

            <SettingsSection title={t('settings.reminders')}>
              <FieldRow
                label={t('settings.snooze')}
                value={`${settings.snoozeMinutes} ${t('settings.minutesUnit')}`}
                onPress={() => setSheet('snooze')}
              />
            </SettingsSection>

            <SettingsSection title={t('settings.appearance')}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('settings.language')}
              </ThemedText>
              <SegmentedControl
                options={LANGUAGE_OPTIONS.map((value) => ({
                  value,
                  label: t(LANGUAGE_LABEL_KEYS[value]),
                }))}
                selected={settings.language}
                onSelect={setLanguage}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {t('settings.theme')}
              </ThemedText>
              <SegmentedControl
                options={THEME_OPTIONS.map((value) => ({
                  value,
                  label: t(THEME_LABEL_KEYS[value]),
                }))}
                selected={settings.theme}
                onSelect={setTheme}
              />
              <ThemedText type="small" themeColor="textSecondary">
                {t('settings.season')}
              </ThemedText>
              <SegmentedControl
                options={SEASON_OPTIONS.map((value) => ({
                  value,
                  label: t(SEASON_LABEL_KEYS[value]),
                }))}
                selected={settings.seasonPreference}
                onSelect={setSeasonPreference}
              />
            </SettingsSection>

            {appLock.available === null ? null : (
              <AppLockSection
                enabled={settings.appLockEnabled}
                available={appLock.available}
                onChange={(enabled) => void appLock.change(enabled)}
              />
            )}

            <AboutLine
              appName={Constants.expoConfig?.name ?? ''}
              version={Constants.expoConfig?.version ?? ''}
              repositoryUrl={String(
                Constants.expoConfig?.extra?.repositoryUrl ?? '',
              )}
              author={AUTHOR_NAME}
            />
          </ScrollView>
        </SafeAreaView>
      </ThemedView>

      {sheet === 'snooze' ? (
        <SnoozeSheet
          minutes={settings.snoozeMinutes}
          onSave={(minutes) => {
            const previous = settings.snoozeMinutes;
            void runWithUndo(
              {
                message: t('editor.saved', { field: t('settings.snooze') }),
                apply: () => setSnoozeMinutes(minutes),
                revert: () => setSnoozeMinutes(previous),
              },
              'settings.errorSave',
              closeSheet,
            );
          }}
          onClose={closeSheet}
        />
      ) : null}
      <UndoSnackbar snackbar={snackbar} />
    </>
  );
}

const LANGUAGE_LABEL_KEYS: Record<LanguagePreference, string> = {
  system: 'settings.languageSystem',
  pl: 'settings.languagePl',
  en: 'settings.languageEn',
};

const THEME_LABEL_KEYS: Record<ThemePreference, string> = {
  system: 'settings.themeSystem',
  light: 'settings.themeLight',
  dark: 'settings.themeDark',
};

const SEASON_LABEL_KEYS: Record<SeasonPreference, string> = {
  auto: 'settings.seasonAuto',
  spring: 'settings.seasonSpring',
  summer: 'settings.seasonSummer',
  autumn: 'settings.seasonAutumn',
  winter: 'settings.seasonWinter',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.twenty,
  },
  content: {
    gap: Spacing.twentyFour,
    paddingBottom: Spacing.sixteen,
  },
});
