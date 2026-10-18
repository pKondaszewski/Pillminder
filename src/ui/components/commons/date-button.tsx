import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { useFormatDate } from '@/ui/hooks/use-format-date';

import { ThemedText } from './themed-text';
import { ThemedView } from './themed-view';

type Props = {
  label: string;
  value: Date;
  onPress: () => void;
};

export function DateButton({ label, value, onPress }: Props) {
  const formatDate = useFormatDate();
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [styles.button, pressed && styles.pressed]}
    >
      <ThemedView type="surface" style={styles.box}>
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
    padding: Spacing.sixteen,
    borderRadius: Spacing.sixteen,
    gap: Spacing.four,
  },
  pressed: { opacity: 0.7 },
});
