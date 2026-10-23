import { Stack } from 'expo-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet } from 'react-native';

import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedView } from '@/commons/ui/themed-view';
import { UndoSnackbar } from '@/commons/ui/undo-snackbar';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import { ImageSourceSheet } from '@/products/ui/image-source-sheet';
import { PhotoGrid } from '@/products/ui/photo-grid';
import { usePendingPhotos } from '@/products/ui/use-pending-photos';

export default function NewProductPhotosScreen() {
  const { t } = useTranslation();
  const { snackbar, runWithUndo } = useUndoSnackbar();
  const { uris, photos, addPhotos, removePhoto, setProfilePhoto } =
    usePendingPhotos(runWithUndo);
  const [sourceSheetVisible, setSourceSheetVisible] = useState(false);

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen options={{ headerShown: true, title: t('images.title') }} />
      <ScrollView contentContainerStyle={styles.content}>
        <PhotoGrid
          photos={photos}
          profilePhotoId={uris[0] ?? null}
          onAdd={() => setSourceSheetVisible(true)}
          onSetProfile={setProfilePhoto}
          onDelete={removePhoto}
        />
      </ScrollView>
      <UndoSnackbar snackbar={snackbar} />
      <ImageSourceSheet
        visible={sourceSheetVisible}
        onClose={() => setSourceSheetVisible(false)}
        onSelect={addPhotos}
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
