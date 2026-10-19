import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { AppLogo } from '@/commons/ui/app-logo';
import { PrimaryButton } from '@/commons/ui/button';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';

export type OnboardingProgress = { current: number; total: number };

type Props = {
  progress: OnboardingProgress;
  children: ReactNode;
  primaryLabel: string;
  onPrimary: () => void;
  primaryDisabled?: boolean;
  skipLabel: string;
  onSkip: () => void;
};

export function OnboardingStepLayout({
  progress,
  children,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  skipLabel,
  onSkip,
}: Props) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.step}>
      <ThemedView style={styles.header}>
        <AppLogo size={32} name={t('onboarding.appName')} />
        {progress.total > 1 ? (
          <ThemedText type="small" themeColor="textSecondary">
            {t('onboarding.progress', progress)}
          </ThemedText>
        ) : null}
      </ThemedView>
      <ThemedView style={styles.body}>{children}</ThemedView>
      <ThemedView style={styles.actions}>
        <ThemedView style={styles.primary}>
          <PrimaryButton
            label={primaryLabel}
            onPress={onPrimary}
            disabled={primaryDisabled}
          />
        </ThemedView>
        <Pressable
          onPress={onSkip}
          accessibilityRole="button"
          style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
        >
          <ThemedText type="smallBold" themeColor="textSecondary">
            {skipLabel}
          </ThemedText>
        </Pressable>
      </ThemedView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  step: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  body: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.sixteen,
  },
  actions: {
    gap: Spacing.eight,
  },
  primary: {
    flexDirection: 'row',
  },
  skip: {
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
