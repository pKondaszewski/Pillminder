import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedView } from '@/commons/ui/themed-view';
import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import { orderPhotos } from '@/images/image-service';
import { ImageSourceSheet } from '@/products/ui/image-source-sheet';
import { PhotoGrid } from '@/products/ui/photo-grid';
import { usePhotoUndo } from '@/products/ui/use-photo-undo';
import { useProductImages } from '@/products/ui/use-product-images';
import { useProducts } from '@/products/ui/use-products';
import { useProfileUndo } from '@/products/ui/use-profile-undo';

export default function ProductPhotosScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const profileImageId =
    products.find((p) => p.id === id)?.profileImageId ?? null;
  const { images } = useProductImages(id);
  const { snackbar, runWithUndo } = useUndoSnackbar();
  const { busy, pickAndAddImage, removeImageWithUndo } = usePhotoUndo(
    id,
    profileImageId,
    runWithUndo,
  );
  const { setProfileWithUndo } = useProfileUndo(
    id,
    profileImageId,
    runWithUndo,
  );
  const [sourceSheetVisible, setSourceSheetVisible] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: t('images.title') }} />
      <ScrollView contentContainerStyle={styles.content}>
        <PhotoGrid
          images={orderPhotos(images, profileImageId)}
          profileImageId={profileImageId}
          addDisabled={busy}
          onAdd={() => setSourceSheetVisible(true)}
          onSetProfile={(image) => setProfileWithUndo(image.id)}
          onDelete={removeImageWithUndo}
        />
      </ScrollView>
      <UndoSnackbar snackbar={snackbar} />
      <ImageSourceSheet
        visible={sourceSheetVisible}
        onClose={() => setSourceSheetVisible(false)}
        onSelect={pickAndAddImage}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: Spacing.twenty,
  },
});
