import { useColorScheme } from 'react-native';

import { ACCENT_COLORS, Colors } from '@/ui/commons/constants/theme';
import { useSettings } from '@/ui/hooks/use-settings';

export function useTheme() {
  const scheme = useColorScheme();
  const { accent } = useSettings();
  const theme = scheme === 'unspecified' ? 'light' : scheme;

  return { ...Colors[theme], accent: ACCENT_COLORS[accent] };
}
