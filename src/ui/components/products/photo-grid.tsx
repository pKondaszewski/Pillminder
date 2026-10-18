import { Image } from 'expo-image';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, Pressable, StyleSheet } from 'react-native';

import { imageFileUri, type ProductImage } from '@/images/image-service';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { Icon } from '@/ui/components/commons/icon';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { PhotoTile } from '@/ui/components/products/photo-tile';
import { useTheme } from '@/ui/hooks/use-theme';

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
  const [previewed, setPreviewed] = useState<ProductImage | null>(null);

  return (
    <ThemedView style={styles.grid}>
      {images.map((image) => (
        <ThemedView key={image.id} style={styles.cell}>
          <PhotoTile
            fileName={image.fileName}
            profile={image.id === profileImageId}
            onPress={() => setPreviewed(image)}
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

      <Modal
        visible={previewed !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewed(null)}
      >
        <Pressable
          style={[styles.preview, { backgroundColor: theme.scrim }]}
          onPress={() => setPreviewed(null)}
        >
          {previewed ? (
            <Image
              source={{ uri: imageFileUri(previewed.fileName) }}
              style={styles.previewImage}
              contentFit="contain"
            />
          ) : null}
        </Pressable>
      </Modal>
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
  preview: {
    flex: 1,
    justifyContent: 'center',
  },
  previewImage: {
    flex: 1,
  },
});
