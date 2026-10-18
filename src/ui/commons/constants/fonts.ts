import { IBMPlexMono_500Medium } from '@expo-google-fonts/ibm-plex-mono/500Medium';
import { IBMPlexSans_400Regular } from '@expo-google-fonts/ibm-plex-sans/400Regular';
import { IBMPlexSans_500Medium } from '@expo-google-fonts/ibm-plex-sans/500Medium';
import { IBMPlexSans_600SemiBold } from '@expo-google-fonts/ibm-plex-sans/600SemiBold';
import { IBMPlexSans_700Bold } from '@expo-google-fonts/ibm-plex-sans/700Bold';

export const FontFamily = {
  regular: 'IBMPlexSans_400Regular',
  medium: 'IBMPlexSans_500Medium',
  semiBold: 'IBMPlexSans_600SemiBold',
  bold: 'IBMPlexSans_700Bold',
  mono: 'IBMPlexMono_500Medium',
} as const;

export const FONT_ASSETS = {
  [FontFamily.regular]: IBMPlexSans_400Regular,
  [FontFamily.medium]: IBMPlexSans_500Medium,
  [FontFamily.semiBold]: IBMPlexSans_600SemiBold,
  [FontFamily.bold]: IBMPlexSans_700Bold,
  [FontFamily.mono]: IBMPlexMono_500Medium,
};
