import { Image } from 'expo-image';
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
import { ActionButton } from '@/ui/components/commons/action-button';
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

  const handleDelete = (image: ProductImage) => {
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
  };

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
                onPress={() => handleDelete(image)}
                hitSlop={Spacing.two}
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
        <ActionButton
          label={t('images.camera')}
          onPress={() => pickAndAddImage('camera', role)}
          disabled={busy}
        />
        <ActionButton
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

const styles = StyleSheet.create({
  section: {
    gap: Spacing.two,
    marginTop: Spacing.three,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.three,
  },
  item: {
    gap: Spacing.one,
    alignItems: 'center',
  },
  thumbnail: {
    width: 96,
    height: 96,
    borderRadius: Spacing.two,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
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
