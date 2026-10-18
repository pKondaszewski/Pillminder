import { Switch as NativeSwitch } from 'react-native';

import { MIN_TOUCH_SIZE } from '@/ui/commons/constants/theme';
import { useTheme } from '@/ui/hooks/use-theme';

type Props = {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
};

export function Switch({ value, onValueChange, accessibilityLabel }: Props) {
  const theme = useTheme();

  return (
    <NativeSwitch
      value={value}
      onValueChange={onValueChange}
      accessibilityLabel={accessibilityLabel}
      trackColor={{ false: theme.borderStrong, true: theme.accent }}
      thumbColor={theme.background}
      style={{ minHeight: MIN_TOUCH_SIZE }}
    />
  );
}
