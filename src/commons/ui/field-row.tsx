import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';

type Props = {
  label: string;
  value: string;
  onPress: () => void;
};

export function FieldRow({ label, value, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.row,
        { borderBottomColor: theme.divider },
        pressed && styles.pressed,
      ]}
    >
      <ThemedText>{label}</ThemedText>
      <ThemedView style={styles.value}>
        <ThemedText themeColor="textSecondary" numberOfLines={1}>
          {value}
        </ThemedText>
        <Icon name="chevron_right" size={20} color={theme.textTertiary} />
      </ThemedView>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sixteen,
    minHeight: MIN_TOUCH_SIZE,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  value: {
    flexShrink: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.four,
  },
  pressed: {
    opacity: 0.7,
  },
});
