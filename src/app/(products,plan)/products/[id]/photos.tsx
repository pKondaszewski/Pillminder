import { Stack, useLocalSearchParams } from 'expo-router';
import type { TFunction } from 'i18next';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import type { ProductImage } from '@/images/image-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { Snackbar } from '@/ui/components/commons/snackbar';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { ImageSourceSheet } from '@/ui/components/products/image-source-sheet';
import { PhotoGrid } from '@/ui/components/products/photo-grid';
import { useProductImages } from '@/ui/hooks/use-product-images';
import { useProducts } from '@/ui/hooks/use-products';

export default function ProductPhotosScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const profileImageId =
    products.find((p) => p.id === id)?.profileImageId ?? null;
  const {
    images,
    busy,
    pickAndAddImage,
    removeImage,
    setProfile,
    profileUndo,
    undoProfile,
    dismissProfileUndo,
  } = useProductImages(id, profileImageId);
  const [sourceSheetVisible, setSourceSheetVisible] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: t('images.title') }} />
      <ScrollView contentContainerStyle={styles.content}>
        <PhotoGrid
          images={images}
          profileImageId={profileImageId}
          addDisabled={busy}
          onAdd={() => setSourceSheetVisible(true)}
          onSetProfile={(image) => setProfile(image.id)}
          onDelete={(image) => confirmDeleteImage(image, t, removeImage)}
        />
      </ScrollView>
      {profileUndo ? (
        <Snackbar
          key={profileUndo.key}
          message={t('images.profileChanged')}
          actionLabel={t('home.undo')}
          onAction={undoProfile}
          onDismiss={dismissProfileUndo}
        />
      ) : null}
      <ImageSourceSheet
        visible={sourceSheetVisible}
        onClose={() => setSourceSheetVisible(false)}
        onSelect={pickAndAddImage}
      />
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
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.twenty,
  },
});
