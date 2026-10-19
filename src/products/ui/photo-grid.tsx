import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/commons/ui/constants/theme';
import { Icon } from '@/commons/ui/icon';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useTheme } from '@/commons/ui/use-theme';
import type { ProductImage } from '@/images/image-service';
import { PhotoGallery } from '@/products/ui/photo-gallery';
import { PhotoTile } from '@/products/ui/photo-tile';

type Props = {
  images: ProductImage[];
  profileImageId: string | null;
  addDisabled: boolean;
  onAdd: () => void;
  onSetProfile: (image: ProductImage) => void;
  onDelete: (image: ProductImage) => void;
};

export function PhotoGrid({
  images,
  profileImageId,
  addDisabled,
  onAdd,
  onSetProfile,
  onDelete,
}: Props) {
  const { t } = useTranslation();
  const theme = useTheme();
  const [previewedIndex, setPreviewedIndex] = useState<number | null>(null);

  return (
    <ThemedView style={styles.grid}>
      {images.map((image, index) => (
        <ThemedView key={image.id} style={styles.cell}>
          <PhotoTile
            fileName={image.fileName}
            profile={image.id === profileImageId}
            onPress={() => setPreviewedIndex(index)}
            onSetProfile={() => onSetProfile(image)}
            onDelete={() => onDelete(image)}
          />
        </ThemedView>
      ))}
      <ThemedView style={styles.cell}>
        <Pressable
          onPress={onAdd}
          disabled={addDisabled}
          accessibilityRole="button"
          accessibilityLabel={t('images.add')}
          style={[styles.addTile, { borderColor: theme.borderStrong }]}
        >
          <Icon name="add_a_photo" size={28} color={theme.textSecondary} />
          <ThemedText type="small" themeColor="textSecondary">
            {t('images.add')}
          </ThemedText>
        </Pressable>
      </ThemedView>

      <PhotoGallery
        images={images}
        startIndex={previewedIndex}
        onClose={() => setPreviewedIndex(null)}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.twelve,
  },
  cell: {
    flexBasis: '47%',
    flexGrow: 1,
  },
  addTile: {
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.eight,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: Radius.card,
  },
});
