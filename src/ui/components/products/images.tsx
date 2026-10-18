import { Image } from 'expo-image';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Modal, Pressable, StyleSheet } from 'react-native';

import {
  IMAGE_ROLES,
  imageFileUri,
  type ImageRole,
  type ProductImage,
} from '@/images/image-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { SecondaryButton } from '@/ui/components/commons/button';
import { Chip } from '@/ui/components/commons/chip';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useProductImages } from '@/ui/hooks/use-product-images';

export function ProductImages({ productId }: { productId: string }) {
  const { t } = useTranslation();
  const { images, busy, pickAndAddImage, removeImage } =
    useProductImages(productId);
  const [role, setRole] = useState<ImageRole>(IMAGE_ROLES[0]);
  const [previewed, setPreviewed] = useState<ProductImage | null>(null);

  return (
    <ThemedView style={styles.section}>
      <ThemedText type="small">{t('images.title')}</ThemedText>
      {images.length === 0 ? (
        <ThemedText type="small" themeColor="textSecondary">
          {t('images.empty')}
        </ThemedText>
      ) : (
        <ThemedView style={styles.grid}>
          {images.map((image) => (
            <ThemedView key={image.id} style={styles.item}>
              <Pressable
                onPress={() => setPreviewed(image)}
                accessibilityLabel={t('images.preview')}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <Image
                  source={{ uri: imageFileUri(image.fileName) }}
                  style={styles.thumbnail}
                  contentFit="cover"
                />
              </Pressable>
              <ThemedText type="small" themeColor="textSecondary">
                {t(`images.role.${image.role}`)}
              </ThemedText>
              <Pressable
                onPress={() => confirmDeleteImage(image, t, removeImage)}
                hitSlop={Spacing.eight}
                style={({ pressed }) => pressed && styles.pressed}
              >
                <ThemedText type="smallBold" themeColor="danger">
                  {t('editor.delete')}
                </ThemedText>
              </Pressable>
            </ThemedView>
          ))}
        </ThemedView>
      )}

      <ThemedView style={styles.chipRow}>
        {IMAGE_ROLES.map((r) => (
          <Chip
            key={r}
            label={t(`images.role.${r}`)}
            selected={r === role}
            onPress={() => setRole(r)}
          />
        ))}
      </ThemedView>
      <ThemedView style={styles.actions}>
        <SecondaryButton
          label={t('images.camera')}
          onPress={() => pickAndAddImage('camera', role)}
          disabled={busy}
        />
        <SecondaryButton
          label={t('images.gallery')}
          onPress={() => pickAndAddImage('gallery', role)}
          disabled={busy}
        />
      </ThemedView>

      <Modal
        visible={previewed !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setPreviewed(null)}
      >
        <Pressable style={styles.preview} onPress={() => setPreviewed(null)}>
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

function confirmDeleteImage(
  image: ProductImage,
  t: TFunction,
  removeImage: (image: ProductImage) => Promise<void>,
) {
  Alert.alert(t('images.deleteTitle'), t('images.deleteConfirm'), [
    { text: t('editor.cancel'), style: 'cancel' },
    {
      text: t('editor.delete'),
      style: 'destructive',
      onPress: async () => {
        try {
          await removeImage(image);
        } catch {
          Alert.alert(t('products.errorTitle'), t('images.errorDelete'));
        }
      },
    },
  ]);
}

const styles = StyleSheet.create({
  section: {
    gap: Spacing.eight,
    marginTop: Spacing.sixteen,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sixteen,
  },
  item: {
    gap: Spacing.four,
    alignItems: 'center',
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: Spacing.eight,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.eight,
  },
  pressed: {
    opacity: 0.7,
  },
  preview: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
  },
  previewImage: {
    flex: 1,
  },
});
