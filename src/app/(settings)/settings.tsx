import Constants from 'expo-constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Linking, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTHOR_NAME } from '@/config/app-info';
import { permissionStep } from '@/onboarding/onboarding-service';
import { currencyLabel } from '@/settings/format-price';
import {
  setCurrency,
  setLanguage,
  setSnoozeMinutes,
  setTheme,
} from '@/settings/settings-service';
import {
  LANGUAGE_OPTIONS,
  type LanguagePreference,
  THEME_OPTIONS,
  type ThemePreference,
} from '@/settings/settings-store';
import { Spacing } from '@/ui/commons/constants/theme';
import { BackupImportDialog } from '@/ui/components/commons/backup-import-dialog';
import { FieldRow } from '@/ui/components/commons/field-row';
import { ScreenTitle } from '@/ui/components/commons/screen-title';
import { SegmentedControl } from '@/ui/components/commons/segmented-control';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { UndoSnackbar } from '@/ui/components/commons/undo-snackbar';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { AboutLine } from '@/ui/components/settings/about-line';
import { BackupSection } from '@/ui/components/settings/backup-section';
import { CurrencySheet } from '@/ui/components/settings/currency-sheet';
import { SettingsSection } from '@/ui/components/settings/settings-section';
import { SnoozeSheet } from '@/ui/components/settings/snooze-sheet';
import { StatusCard } from '@/ui/components/settings/status-card';
import {
  batteryCardState,
  notificationCardState,
} from '@/ui/components/settings/status-card-state';
import { useBackup } from '@/ui/hooks/use-backup';
import { useBatteryOptimization } from '@/ui/hooks/use-battery-optimization';
import { useNotificationPermission } from '@/ui/hooks/use-notification-permission';
import { useSettings } from '@/ui/hooks/use-settings';
import { useUndoSnackbar } from '@/ui/hooks/use-undo-snackbar';

type Sheet = 'snooze' | 'currency';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const settings = useSettings();
  const { permission, request } = useNotificationPermission();
  const battery = useBatteryOptimization();
  const backup = useBackup();
  const [sheet, setSheet] = useState<Sheet | null>(null);
  const { snackbar, runWithUndo } = useUndoSnackbar();

  const notifications = permission
    ? notificationCardState(permissionStep(permission))
    : null;
  const batteryState =
    battery.enabled === null ? null : batteryCardState(battery.enabled);
  const closeSheet = () => setSheet(null);

  return (
    <TabSwipe>
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
                  onFix={
                    notifications.fix === 'request'
                      ? request
                      : () => void Linking.openSettings()
                  }
                />
              ) : null}
              {batteryState ? (
                <StatusCard
                  ok={batteryState.ok}
                  title={t('settings.batteryOptimization')}
                  status={t(batteryState.statusKey)}
                  fixLabel={t('settings.fix')}
                  onFix={() => void battery.openSettings()}
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
            </SettingsSection>

            <SettingsSection title={t('settings.shopping')}>
              <FieldRow
                label={t('settings.currency')}
                value={currencyLabel(settings.currency, i18n.language)}
                onPress={() => setSheet('currency')}
              />
            </SettingsSection>

            <BackupSection
              busy={backup.busy}
              onExport={backup.exportData}
              onImport={backup.importData}
            />

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

      <BackupImportDialog confirmation={backup.importConfirmation} />
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
      {sheet === 'currency' ? (
        <CurrencySheet
          currency={settings.currency}
          locale={i18n.language}
          onSave={(currency) => {
            const previous = settings.currency;
            void runWithUndo(
              {
                message: t('editor.saved', { field: t('settings.currency') }),
                apply: () => setCurrency(currency),
                revert: () => setCurrency(previous),
              },
              'settings.errorSave',
              closeSheet,
            );
          }}
          onClose={closeSheet}
        />
      ) : null}
      <UndoSnackbar snackbar={snackbar} />
    </TabSwipe>
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
