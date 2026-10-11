import { Pressable, StyleSheet } from 'react-native';

import { Spacing, ThemeColor } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  label: string;
  onPress: () => void;
  themeColor?: ThemeColor;
  disabled?: boolean;
  busy?: boolean;
};

export function ActionButton({
  label,
  onPress,
  themeColor,
  disabled,
  busy,
}: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      style={({ pressed }) => [
        styles.button,
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <ThemedView type="backgroundElement" style={styles.inner}>
        <ThemedText type="smallBold" themeColor={themeColor}>
          {label}
        </ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    // Fills the row; in a column parent it would collapse, so wrap it in a row
    flex: 1,
  },
  inner: {
    paddingVertical: Spacing.three,
    borderRadius: Spacing.three,
    alignItems: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
