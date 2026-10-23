import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ProductAvatar } from '@/commons/ui/product-avatar';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import { PhotoCountBadge } from '@/products/ui/photo-count-badge';

const PHOTO_TILE_SIZE = 88;

type Props = {
  category: string;
  profileUri: string | null;
  count: number;
  onPress: () => void;
};

export function PhotoPickerTile({
  category,
  profileUri,
  count,
  onPress,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        count > 0 ? t('products.detail.photos', { count }) : t('images.add')
      }
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      {profileUri === null ? (
        <ThemedView style={[styles.empty, { borderColor: theme.borderStrong }]}>
          <Icon name="add_a_photo" size={28} color={theme.textSecondary} />
        </ThemedView>
      ) : (
        <ProductAvatar
          category={category}
          size={PHOTO_TILE_SIZE}
          imageUri={profileUri}
        />
      )}
      {count > 0 ? <PhotoCountBadge count={count} /> : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    alignSelf: 'center',
  },
  empty: {
    width: PHOTO_TILE_SIZE,
    height: PHOTO_TILE_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.card,
    borderWidth: 1,
    borderStyle: 'dashed',
  },
  pressed: {
    opacity: 0.7,
  },
});
