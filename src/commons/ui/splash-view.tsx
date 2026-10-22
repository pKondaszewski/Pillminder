import Constants from 'expo-constants';
import { Image } from 'expo-image';
import { StyleSheet, Text, View } from 'react-native';

import { FontFamily } from '@/commons/ui/constants/fonts';
import { Colors, Spacing } from '@/commons/ui/constants/theme';

export function SplashView() {
  return (
    <View style={styles.backgroundSolidColor}>
      <Image
        source={splashIcon}
        accessibilityIgnoresInvertColors
        style={styles.mark}
      />
      <Text style={styles.wordmark} numberOfLines={1}>
        {Constants.expoConfig?.name}
      </Text>
    </View>
  );
}

const splashIcon = require('../../../assets/images/splash-icon.png');

// Must match imageWidth of the expo-splash-screen plugin in app.json
const SPLASH_IMAGE_WIDTH = 76;

const WORDMARK_WIDTH = 240;

const styles = StyleSheet.create({
  backgroundSolidColor: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.accent,
  },
  mark: {
    width: SPLASH_IMAGE_WIDTH,
    height: SPLASH_IMAGE_WIDTH,
  },
  // Out of the layout flow so the mark stays at the exact centre where the native splash draws it
  wordmark: {
    position: 'absolute',
    top: '50%',
    marginTop: SPLASH_IMAGE_WIDTH / 2 + Spacing.sixteen,
    width: WORDMARK_WIDTH,
    textAlign: 'center',
    fontFamily: FontFamily.semiBold,
    fontSize: 26,
    lineHeight: 32,
    color: Colors.light.onAccent,
  },
});
