import { type ReactNode } from 'react';
import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/commons/ui/constants/theme';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';

type Props = {
  decrementLabel: string;
  incrementLabel: string;
  onDecrement: () => void;
  onIncrement: () => void;
  children: ReactNode;
};

export function Stepper({
  decrementLabel,
  incrementLabel,
  onDecrement,
  onIncrement,
  children,
}: Props) {
  return (
    <ThemedView style={styles.row}>
      <StepperButton
        sign="−"
        accessibilityLabel={decrementLabel}
        onPress={onDecrement}
      />
      {children}
      <StepperButton
        sign="+"
        accessibilityLabel={incrementLabel}
        onPress={onIncrement}
      />
    </ThemedView>
  );
}

function StepperButton({
  sign,
  accessibilityLabel,
  onPress,
}: {
  sign: '−' | '+';
  accessibilityLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <ThemedView type="surface" style={styles.button}>
        <ThemedText type="subtitle">{sign}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sixteen,
  },
  button: {
    width: MIN_TOUCH_SIZE,
    height: MIN_TOUCH_SIZE,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
