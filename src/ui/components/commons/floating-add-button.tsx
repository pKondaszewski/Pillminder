import { Pressable, StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { Icon } from '@/ui/components/commons/icon';
import { useTheme } from '@/ui/hooks/use-theme';

const BUTTON_SIZE = 56;

export function FloatingAddButton({
  accessibilityLabel,
  onPress,
}: {
  accessibilityLabel: string;
  onPress: () => void;
}) {
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: theme.accent },
        pressed && styles.pressed,
      ]}
    >
      <Icon name="add" size={28} color={theme.onAccent} />
    </Pressable>
  );
}

export const FLOATING_ADD_BUTTON_CLEARANCE =
  BUTTON_SIZE + Spacing.twentyFour * 2;

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: Spacing.twenty,
    bottom: Spacing.twenty,
    width: BUTTON_SIZE,
    height: BUTTON_SIZE,
    borderRadius: BUTTON_SIZE / 2,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
  },
  pressed: {
    opacity: 0.8,
  },
});
