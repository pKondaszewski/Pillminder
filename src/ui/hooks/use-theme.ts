import { useColorScheme } from 'react-native';

import { Colors } from '@/ui/commons/constants/theme';

export function useTheme() {
  const scheme = useColorScheme();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return Colors[theme];
}
