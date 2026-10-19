import { View, type ViewProps } from 'react-native';

import { ThemeColor } from '@/commons/ui/constants/theme';
import { useTheme } from '@/commons/ui/use-theme';

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
