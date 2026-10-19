import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { Icon } from '@/commons/ui/icon';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import { imageFileUri } from '@/images/image-service';
import { categoryAvatar } from '@/products/category-avatar';

const RADIUS_BY_SIZE = { 36: 10, 40: 12, 88: 22 } as const;

type Props = {
  category: string;
  size: keyof typeof RADIUS_BY_SIZE;
  imageFileName?: string | null;
  dimmed?: boolean;
};

export function ProductAvatar({
  category,
  size,
  imageFileName,
  dimmed,
}: Props) {
  const theme = useTheme();
  const { tone, icon } = categoryAvatar(category);
  const colors = theme.category[tone];
  const shape = {
    width: size,
    height: size,
    borderRadius: RADIUS_BY_SIZE[size],
  };

  return (
    <ThemedView
      style={[
        styles.tile,
        shape,
        { backgroundColor: colors.tile },
        dimmed && styles.dimmed,
      ]}
    >
      {imageFileName ? (
        <Image source={{ uri: imageFileUri(imageFileName) }} style={shape} />
      ) : (
        <Icon name={icon} size={size / 2} color={colors.icon} />
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dimmed: {
    opacity: 0.45,
  },
});
