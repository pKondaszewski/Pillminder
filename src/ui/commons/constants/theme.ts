import type { AccentPreference } from '@/settings/settings-store';

export const ACCENT_COLORS: Record<AccentPreference, string> = {
  blue: '#3c87f7',
  green: '#279c58',
  purple: '#a76cea',
  orange: '#e0640c',
  pink: '#eb4d8f',
  teal: '#1b9894',
};

export const Colors = {
  light: {
    text: '#000000',
    background: '#ffffff',
    backgroundElement: '#F0F0F3',
    backgroundSelected: '#E0E1E6',
    textSecondary: '#60646C',
    danger: '#D9534F',
    success: '#3aa76d',
    warning: '#d97706',
    accent: ACCENT_COLORS.blue,
  },
  dark: {
    text: '#ffffff',
    background: '#000000',
    backgroundElement: '#212225',
    backgroundSelected: '#2E3135',
    textSecondary: '#B0B4BA',
    danger: '#FF6B66',
    success: '#3aa76d',
    warning: '#d97706',
    accent: ACCENT_COLORS.blue,
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Spacing = {
  one: 4,
  two: 8,
  three: 16,
  four: 24,
} as const;
