import { Switch as NativeSwitch } from 'react-native';

import { MIN_TOUCH_SIZE } from '@/commons/ui/constants/theme';
import { useTheme } from '@/commons/ui/use-theme';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  disabled?: boolean;
};

export function Switch({
  value,
  onValueChange,
  accessibilityLabel,
  disabled,
}: Props) {
  const theme = useTheme();

  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      disabled={disabled}
      trackColor={{ false: theme.borderStrong, true: theme.accent }}
      thumbColor={theme.background}
      style={{ minHeight: MIN_TOUCH_SIZE }}
    />
  );
}
