import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  size: number;
  name?: string;
};

export function AppLogo({ size, name }: Props) {
  return (
    <ThemedView style={styles.row}>
      <Image
        source={logo}
        accessibilityIgnoresInvertColors
        style={{ width: size, height: size, borderRadius: size * RADIUS_RATIO }}
      />
      {name ? <ThemedText type="headline">{name}</ThemedText> : null}
    </ThemedView>
  );
}

const logo = require('../../../../assets/images/logo.png');

// Same proportion as the rounded square in app-icon.svg (rx 15 of 64)
const RADIUS_RATIO = 15 / 64;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.ten,
  },
});
