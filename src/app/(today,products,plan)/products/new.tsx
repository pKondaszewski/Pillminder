import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet } from 'react-native';

import { ThemedView } from '@/commons/ui/themed-view';
import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import { creationChange } from '@/config/undoable-change';
import { addImage } from '@/images/image-service';
import type { NewProductInput } from '@/products/dto/new-product-input';
import { NewProductForm } from '@/products/ui/new-product-form';
import { clearPendingUris } from '@/products/ui/pending-photos-store';
import { useProducts } from '@/products/ui/use-products';

export default function NewProductScreen() {
  const { t } = useTranslation();
  const { forSchedule } = useLocalSearchParams<{ forSchedule?: string }>();
  const { addProduct, removeProduct } = useProducts();
  const { runWithUndoOnNextScreen } = useUndoSnackbar();

  useEffect(() => {
    clearPendingUris();
    return clearPendingUris;
  }, []);

  const runThenOpenSchedule = useRunWithErrorAlert((createdId: string) =>
    router.dismissTo({
      pathname: '/schedules/new',
      params: { productId: createdId },
    }),
  );

  const submit = (input: NewProductInput, photoUris: string[]) =>
    forSchedule
      ? // no undo: the schedule form would take it and renders no snackbar
        runThenOpenSchedule(
          () => createProduct(input, photoUris),
          'products.errorSave',
        )
      : runWithUndoOnNextScreen(
          creationChange(
            t('products.added'),
            () => createProduct(input, photoUris),
            removeProduct,
          ),
          'products.errorSave',
          () => router.back(),
        );

  const createProduct = async (input: NewProductInput, photoUris: string[]) => {
    const createdId = await addProduct(input);
    await addPhotos(createdId, photoUris);
    return createdId;
  };

  const addPhotos = async (productId: string, uris: string[]) => {
    try {
      for (const uri of uris) {
        await addImage(productId, uri);
      }
    } catch {
      Alert.alert(t('products.errorTitle'), t('images.errorSave'));
    }
  };

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{ headerShown: true, title: t('editor.newTitle') }}
      />
      <NewProductForm
        onPhotosPress={() => router.push('/products/new-photos')}
        onSubmit={submit}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
