import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/ui/commons/constants/theme';
import { useTheme } from '@/ui/hooks/use-theme';

type ThemedViewProps = ViewProps & {
  type?: ThemeColor;
};

export function ThemedView({ style, type, ...otherProps }: ThemedViewProps) {
  const theme = useTheme();

  return (
    <View
      style={[{ backgroundColor: theme[type ?? 'background'] }, style]}
      {...otherProps}
    />
  );
}
