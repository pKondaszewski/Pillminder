import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { formatDate } from '@/ui/commons/format-date';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  label: string;
  value: Date;
  onPress: () => void;
};

export function DateButton({ label, value, onPress }: Props) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <ThemedView type="backgroundElement" style={styles.box}>
        <ThemedText type="small" themeColor="textSecondary">
          {label}
        </ThemedText>
        <ThemedText themeColor="accent">{formatDate(value)}</ThemedText>
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: { flex: 1 },
  box: {
    padding: Spacing.three,
    borderRadius: Spacing.three,
    gap: Spacing.one,
  },
  pressed: { opacity: 0.7 },
});
