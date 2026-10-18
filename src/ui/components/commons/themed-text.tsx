import { StyleSheet, Text, type TextProps } from 'react-native';

import { FontFamily } from '@/ui/commons/constants/fonts';
import { ThemeColor } from '@/ui/commons/constants/theme';
import { useTheme } from '@/ui/hooks/use-theme';

type ThemedTextProps = TextProps & {
  type?: keyof typeof styles;
  themeColor?: ThemeColor;
};

const DEFAULT_COLORS: Partial<Record<keyof typeof styles, ThemeColor>> = {
  label: 'textSecondary',
  caption: 'textTertiary',
};

export function ThemedText({
  style,
  type = 'default',
  themeColor,
  ...rest
}: ThemedTextProps) {
  const theme = useTheme();
  const color = themeColor ?? DEFAULT_COLORS[type] ?? 'text';

  return (
    <Text style={[{ color: theme[color] }, styles[type], style]} {...rest} />
  );
}

const styles = StyleSheet.create({
  title: {
    fontFamily: FontFamily.bold,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: FontFamily.bold,
    fontSize: 20,
    lineHeight: 28,
  },
  headline: {
    fontFamily: FontFamily.semiBold,
    fontSize: 17,
    lineHeight: 24,
  },
  default: {
    fontFamily: FontFamily.medium,
    fontSize: 15,
    lineHeight: 22,
  },
  small: {
    fontFamily: FontFamily.regular,
    fontSize: 13,
    lineHeight: 18,
  },
  smallBold: {
    fontFamily: FontFamily.semiBold,
    fontSize: 14,
    lineHeight: 20,
  },
  label: {
    fontFamily: FontFamily.semiBold,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  caption: {
    fontFamily: FontFamily.regular,
    fontSize: 12,
    lineHeight: 16,
  },
  mono: {
    fontFamily: FontFamily.mono,
    fontSize: 15,
    lineHeight: 22,
  },
});
