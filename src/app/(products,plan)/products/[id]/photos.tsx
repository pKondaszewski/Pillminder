import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { orderPhotos } from '@/images/image-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { UndoSnackbar } from '@/ui/components/commons/undo-snackbar';
import { ImageSourceSheet } from '@/ui/components/products/image-source-sheet';
import { PhotoGrid } from '@/ui/components/products/photo-grid';
import { usePhotoUndo } from '@/ui/hooks/use-photo-undo';
import { useProductImages } from '@/ui/hooks/use-product-images';
import { useProducts } from '@/ui/hooks/use-products';
import { useProfileUndo } from '@/ui/hooks/use-profile-undo';
import { useUndoSnackbar } from '@/ui/hooks/use-undo-snackbar';

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
