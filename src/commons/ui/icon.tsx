import { type AndroidSymbol, SymbolView } from 'expo-symbols';

import { useTheme } from '@/commons/ui/use-theme';

type Props = {
  name: AndroidSymbol;
  color?: string;
  size?: number;
};

export function Icon({ name, color, size = 24 }: Props) {
  const theme = useTheme();

  return (
    <SymbolView
      name={{ android: name }}
      tintColor={color ?? theme.text}
      size={size}
    />
  );
}
