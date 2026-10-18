import { Pressable, StyleSheet } from 'react-native';

import { MIN_TOUCH_SIZE, Radius, Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  label: string;
  filled?: boolean;
  onPress: () => void;
};

export function DoseActionButton({ label, filled, onPress }: Props) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: filled ? theme.accent : theme.background,
          borderColor: filled ? theme.accent : theme.borderStrong,
        },
        pressed && styles.pressed,
      ]}
    >
      <ThemedText type="smallBold" themeColor={filled ? 'onAccent' : 'text'}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: MIN_TOUCH_SIZE,
    minWidth: MIN_TOUCH_SIZE,
    paddingHorizontal: Spacing.fourteen,
    borderWidth: 1,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.7,
  },
});
