import Constants from 'expo-constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTHOR_NAME } from '@/config/app-info';
import {
  type PermissionStep,
  permissionStep,
} from '@/onboarding/onboarding-service';
import {
  setCurrency,
  setLanguage,
  setSnoozeMinutes,
  setTheme,
} from '@/settings/settings-service';
import {
  CURRENCY_OPTIONS,
  isValidSnoozeMinutes,
  LANGUAGE_OPTIONS,
  type LanguagePreference,
  SNOOZE_MINUTES_MAX,
  SNOOZE_MINUTES_MIN,
  THEME_OPTIONS,
  type ThemePreference,
} from '@/settings/settings-store';
import { Spacing } from '@/ui/commons/constants/theme';
import { Chip } from '@/ui/components/commons/chip';
import { Stepper } from '@/ui/components/commons/stepper';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
import { useBackup } from '@/ui/hooks/use-backup';
import { useBatteryOptimization } from '@/ui/hooks/use-battery-optimization';
import { useNotificationPermission } from '@/ui/hooks/use-notification-permission';
import { useSettings } from '@/ui/hooks/use-settings';
import { useTheme } from '@/ui/hooks/use-theme';

export default function SettingsScreen() {
  const { t } = useTranslation();
  const settings = useSettings();

  return (
    <TabSwipe>
      <ThemedView style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <ScrollView contentContainerStyle={styles.content}>
            <Section title={t('settings.appearance')}>
              <OptionRow
                label={t('settings.language')}
                options={LANGUAGE_OPTIONS}
                selected={settings.language}
                optionLabel={(o) => t(LANGUAGE_LABEL_KEYS[o])}
                onSelect={setLanguage}
              />
              <OptionRow
                label={t('settings.theme')}
                options={THEME_OPTIONS}
                selected={settings.theme}
                optionLabel={(o) => t(THEME_LABEL_KEYS[o])}
                onSelect={setTheme}
              />
            </Section>

            <Section title={t('settings.notifications')}>
              <MinutesStepper
                label={t('settings.snooze')}
                value={settings.snoozeMinutes}
                onChange={setSnoozeMinutes}
              />
              <NotificationPermissionRow />
              <BatteryOptimizationRow />
            </Section>

            <Section title={t('settings.price')}>
              <OptionRow
                label={t('settings.currency')}
                options={CURRENCY_OPTIONS}
                selected={settings.currency}
                optionLabel={(currency) => currency}
                onSelect={setCurrency}
              />
            </Section>

            <BackupSection />

            <Section title={t('settings.about')}>
              <ThemedText type="small" themeColor="textSecondary">
                {t('settings.version')}: {Constants.expoConfig?.version ?? '-'}
              </ThemedText>
              <ThemedText type="small" themeColor="textSecondary">
                {t('settings.author')}: {AUTHOR_NAME}
              </ThemedText>
            </Section>
          </ScrollView>
        </SafeAreaView>
      </ThemedView>
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

const PERMISSION_STATUS_KEYS: Record<PermissionStep, string> = {
  granted: 'settings.notificationsGranted',
  askable: 'settings.notificationsAskable',
  blocked: 'settings.notificationsBlocked',
};

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <ThemedView style={styles.section}>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {title}
      </ThemedText>
      {children}
    </ThemedView>
  );
}

function NotificationPermissionRow() {
  const { t } = useTranslation();
  const { permission, request } = useNotificationPermission();
  if (!permission) return null;

  const step = permissionStep(permission);
  const action = {
    granted: undefined,
    askable: { label: t('onboarding.allow'), onPress: request },
    blocked: {
      label: t('onboarding.openSettings'),
      onPress: () => void Linking.openSettings(),
    },
  }[step];

  return (
    <StatusRow
      label={t('settings.notificationsPermission')}
      status={t(PERMISSION_STATUS_KEYS[step])}
      action={action}
    />
  );
}

function BatteryOptimizationRow() {
  const { t } = useTranslation();
  const { enabled, openSettings } = useBatteryOptimization();
  if (enabled === null) return null;

  return (
    <StatusRow
      label={t('settings.batteryOptimization')}
      status={t(
        enabled ? 'settings.batteryRestricted' : 'settings.batteryUnrestricted',
      )}
      action={
        enabled
          ? {
              label: t('onboarding.batteryOpen'),
              onPress: () => void openSettings(),
            }
          : undefined
      }
    />
  );
}

function StatusRow({
  label,
  status,
  action,
}: {
  label: string;
  status: string;
  action?: { label: string; onPress: () => void };
}) {
  return (
    <ThemedView style={styles.optionRow}>
      <ThemedText type="small">{label}</ThemedText>
      <ThemedText type="small" themeColor="textSecondary">
        {status}
      </ThemedText>
      {action && (
        <ThemedView style={styles.chips}>
          <SettingsActionButton label={action.label} onPress={action.onPress} />
        </ThemedView>
      )}
    </ThemedView>
  );
}

function SettingsActionButton({
  label,
  onPress,
  disabled = false,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      style={({ pressed }) => (pressed || disabled) && styles.pressed}
    >
      <ThemedView type="surface" style={styles.chip}>
        <ThemedText type="small">{label}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

function BackupSection() {
  const { t } = useTranslation();
  const { busy, exportData, importData } = useBackup();

  return (
    <Section title={t('backup.title')}>
      <ThemedText type="small" themeColor="textSecondary">
        {t('backup.description')}
      </ThemedText>
      <ThemedView style={styles.chips}>
        {[
          { label: t('backup.export'), onPress: exportData },
          { label: t('backup.import'), onPress: importData },
        ].map(({ label, onPress }) => (
          <SettingsActionButton
            key={label}
            label={label}
            onPress={onPress}
            disabled={busy}
          />
        ))}
      </ThemedView>
    </Section>
  );
}

function MinutesStepper({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (minutes: number) => void;
}) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [draft, setDraft] = useState(String(value));

  const commit = (minutes: number) => {
    const clamped = Math.min(
      SNOOZE_MINUTES_MAX,
      Math.max(SNOOZE_MINUTES_MIN, minutes),
    );
    setDraft(String(clamped));
    onChange(clamped);
  };

  const handleChangeText = (text: string) => {
    const digits = text.replace(/\D/g, '');
    setDraft(digits);
    const parsed = Number(digits);
    if (digits && isValidSnoozeMinutes(parsed)) onChange(parsed);
  };

  return (
    <ThemedView style={styles.optionRow}>
      <ThemedText type="small">{label}</ThemedText>
      <Stepper
        decrementLabel={t('settings.snoozeLess')}
        incrementLabel={t('settings.snoozeMore')}
        onDecrement={() => commit(value - 1)}
        onIncrement={() => commit(value + 1)}
      >
        <TextInput
          value={draft}
          onChangeText={handleChangeText}
          onBlur={() => commit(Number(draft) || value)}
          keyboardType="number-pad"
          maxLength={String(SNOOZE_MINUTES_MAX).length}
          style={[
            styles.stepperInput,
            { color: theme.text, borderColor: theme.borderStrong },
          ]}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {t('settings.minutesUnit')}
        </ThemedText>
      </Stepper>
    </ThemedView>
  );
}

function OptionRow<T extends string | number>({
  label,
  options,
  selected,
  optionLabel,
  onSelect,
}: {
  label: string;
  options: readonly T[];
  selected: T;
  optionLabel: (option: T) => string;
  onSelect: (option: T) => void;
}) {
  return (
    <ThemedView style={styles.optionRow}>
      <ThemedText type="small">{label}</ThemedText>
      <ThemedView style={styles.chips}>
        {options.map((option) => (
          <Chip
            key={option}
            label={optionLabel(option)}
            selected={option === selected}
            onPress={() => onSelect(option)}
          />
        ))}
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
    paddingHorizontal: Spacing.twentyFour,
  },
  content: {
    gap: Spacing.twentyFour,
    paddingVertical: Spacing.sixteen,
  },
  section: {
    gap: Spacing.eight,
  },
  optionRow: {
    gap: Spacing.four,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
  chip: {
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
  },
  stepperInput: {
    minWidth: 72,
    borderWidth: 1,
    borderRadius: Spacing.eight,
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.sixteen,
    fontSize: 16,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
