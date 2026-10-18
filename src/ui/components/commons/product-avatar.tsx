import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';

import { categoryAvatar } from '@/products/category-avatar';
import { Icon } from '@/ui/components/commons/icon';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useTheme } from '@/ui/hooks/use-theme';

const RADIUS_BY_SIZE = { 36: 10, 40: 12, 88: 22 } as const;

type Props = {
  category: string;
  size: keyof typeof RADIUS_BY_SIZE;
  imageUri?: string | null;
  dimmed?: boolean;
};

export function ProductAvatar({ category, size, imageUri, dimmed }: Props) {
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
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={shape} />
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
