import { Stack, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, ScrollView, StyleSheet } from 'react-native';

import type { ProductImage } from '@/images/image-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { ConfirmDialog } from '@/ui/components/commons/confirm-dialog';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { UndoSnackbar } from '@/ui/components/commons/undo-snackbar';
import { ImageSourceSheet } from '@/ui/components/products/image-source-sheet';
import { PhotoGrid } from '@/ui/components/products/photo-grid';
import { useConfirmation } from '@/ui/hooks/use-confirmation';
import { useProductImages } from '@/ui/hooks/use-product-images';
import { useProducts } from '@/ui/hooks/use-products';
import { useProfileUndo } from '@/ui/hooks/use-profile-undo';

export default function ProductPhotosScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const profileImageId =
    products.find((p) => p.id === id)?.profileImageId ?? null;
  const { images, busy, pickAndAddImage, removeImage } = useProductImages(id);
  const { snackbar, setProfileWithUndo } = useProfileUndo(id, profileImageId);
  const deletion = useConfirmation<ProductImage>(async (image) => {
    try {
      await removeImage(image);
    } catch {
      Alert.alert(t('products.errorTitle'), t('images.errorDelete'));
    }
  });
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
          onSetProfile={(image) => setProfileWithUndo(image.id)}
          onDelete={deletion.request}
        />
      </ScrollView>
      <UndoSnackbar snackbar={snackbar} />
      <ConfirmDialog
        visible={deletion.pending !== null}
        destructive
        title={t('images.deleteTitle')}
        message={t('images.deleteConfirm')}
        confirmLabel={t('editor.delete')}
        onConfirm={deletion.confirm}
        onCancel={deletion.cancel}
      />
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
