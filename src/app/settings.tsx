import Constants from 'expo-constants';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, ScrollView, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AUTHOR_NAME } from '@/config/app-info';
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
  SNOOZE_MINUTES_MAX,
  SNOOZE_MINUTES_MIN,
  THEME_OPTIONS,
} from '@/settings/settings-store';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { TabSwipe } from '@/ui/components/navigation/tab-swipe';
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
                optionLabel={(o) =>
                  t(`settings.language${o[0].toUpperCase()}${o.slice(1)}`)
                }
                onSelect={setLanguage}
              />
              <OptionRow
                label={t('settings.theme')}
                options={THEME_OPTIONS}
                selected={settings.theme}
                optionLabel={(o) =>
                  t(`settings.theme${o[0].toUpperCase()}${o.slice(1)}`)
                }
                onSelect={setTheme}
              />
            </Section>

            <Section title={t('settings.notifications')}>
              <MinutesStepper
                label={t('settings.snooze')}
                value={settings.snoozeMinutes}
                onChange={setSnoozeMinutes}
              />
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
      <ThemedView style={styles.stepperRow}>
        <Pressable
          onPress={() => commit(value - 1)}
          hitSlop={Spacing.two}
          accessibilityLabel={t('settings.snoozeLess')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedView type="backgroundElement" style={styles.stepperButton}>
            <ThemedText type="subtitle">−</ThemedText>
          </ThemedView>
        </Pressable>
        <TextInput
          value={draft}
          onChangeText={handleChangeText}
          onBlur={() => commit(Number(draft) || value)}
          keyboardType="number-pad"
          maxLength={String(SNOOZE_MINUTES_MAX).length}
          style={[
            styles.stepperInput,
            { color: theme.text, borderColor: theme.backgroundSelected },
          ]}
        />
        <ThemedText type="small" themeColor="textSecondary">
          {t('settings.minutesUnit')}
        </ThemedText>
        <Pressable
          onPress={() => commit(value + 1)}
          hitSlop={Spacing.two}
          accessibilityLabel={t('settings.snoozeMore')}
          style={({ pressed }) => pressed && styles.pressed}
        >
          <ThemedView type="backgroundElement" style={styles.stepperButton}>
            <ThemedText type="subtitle">+</ThemedText>
          </ThemedView>
        </Pressable>
      </ThemedView>
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
          <Pressable
            key={option}
            onPress={() => onSelect(option)}
            accessibilityRole="button"
            accessibilityState={{ selected: option === selected }}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <ThemedView
              type={
                option === selected ? 'backgroundSelected' : 'backgroundElement'
              }
              style={styles.chip}
            >
              <ThemedText
                type="small"
                themeColor={option === selected ? 'text' : 'textSecondary'}
              >
                {optionLabel(option)}
              </ThemedText>
            </ThemedView>
          </Pressable>
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
    paddingHorizontal: Spacing.four,
  },
  content: {
    gap: Spacing.four,
    paddingVertical: Spacing.three,
  },
  section: {
    gap: Spacing.two,
  },
  optionRow: {
    gap: Spacing.one,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Spacing.three,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  stepperButton: {
    width: 48,
    height: 48,
    borderRadius: Spacing.three,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperInput: {
    minWidth: 72,
    borderWidth: 1,
    borderRadius: Spacing.two,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    fontSize: 16,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
