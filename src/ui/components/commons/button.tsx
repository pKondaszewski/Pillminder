import { Pressable, StyleSheet } from 'react-native';

import {
  MIN_TOUCH_SIZE,
  Radius,
  Spacing,
  type ThemeColor,
} from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  busy?: boolean;
  fitContent?: boolean;
};

type Variant = 'primary' | 'danger' | 'secondary' | 'destructive';

export function PrimaryButton({
  danger,
  ...props
}: Props & { danger?: boolean }) {
  return <Button variant={danger ? 'danger' : 'primary'} {...props} />;
}

export function SecondaryButton(props: Props) {
  return <Button variant="secondary" {...props} />;
}

export function DestructiveButton(props: Props) {
  return <Button variant="destructive" {...props} />;
}

function Button({
  variant,
  label,
  onPress,
  disabled,
  busy,
  fitContent,
}: Props & { variant: Variant }) {
  const theme = useTheme();
  const { background, border, text } = variantColors(theme, variant);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityState={{ disabled, busy }}
      style={({ pressed }) => [
        styles.button,
        fitContent && styles.fitContent,
        { backgroundColor: background, borderColor: border },
        pressed && styles.pressed,
        disabled && styles.disabled,
      ]}
    >
      <ThemedText type="smallBold" themeColor={text}>
        {label}
      </ThemedText>
    </Pressable>
  );
}

function variantColors(
  theme: ReturnType<typeof useTheme>,
  variant: Variant,
): { background: string; border: string; text: ThemeColor } {
  switch (variant) {
    case 'primary':
      return {
        background: theme.accent,
        border: theme.accent,
        text: 'onAccent',
      };
    case 'danger':
      return {
        background: theme.danger,
        border: theme.danger,
        text: 'onAccent',
      };
    case 'secondary':
      return {
        background: theme.background,
        border: theme.borderStrong,
        text: 'text',
      };
    case 'destructive':
      return {
        background: theme.background,
        border: theme.borderStrong,
        text: 'danger',
      };
  }
}

const styles = StyleSheet.create({
  button: {
    // Fills the row; in a column parent it would collapse, so wrap it in a row
    flex: 1,
    minHeight: MIN_TOUCH_SIZE,
    paddingHorizontal: Spacing.sixteen,
    borderWidth: 1,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fitContent: {
    flex: 0,
  },
  pressed: {
    opacity: 0.7,
  },
  disabled: {
    opacity: 0.4,
  },
});
