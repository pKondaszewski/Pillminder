import type { ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

export function OnboardingStepLayout({
  texts,
  actions,
}: {
  texts: ReactNode;
  actions: ReactNode;
}) {
  return (
    <ThemedView style={styles.step}>
      <ThemedView style={styles.texts}>{texts}</ThemedView>
      <ThemedView style={styles.actions}>{actions}</ThemedView>
    </ThemedView>
  );
}

export function PrimaryButton({
  label,
  onPress,
  disabled,
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
      <ThemedView type="accent" style={styles.primary}>
        <ThemedText type="smallBold" style={styles.primaryLabel}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

export function SkipButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.skip, pressed && styles.pressed]}
    >
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  step: {
    flex: 1,
    justifyContent: 'space-between',
  },
  texts: {
    flex: 1,
    justifyContent: 'center',
    gap: Spacing.three,
  },
  actions: {
    gap: Spacing.two,
  },
  primary: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  primaryLabel: {
    color: '#ffffff',
  },
  skip: {
    paddingVertical: Spacing.two,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
