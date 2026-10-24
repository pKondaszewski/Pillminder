import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet } from 'react-native';

import { ThemedView } from '@/commons/ui/themed-view';
import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { addImage, DEFAULT_IMAGE_ROLE } from '@/images/image-service';
import type { NewProductInput } from '@/products/dto/new-product-input';
import { NewProductForm } from '@/products/ui/new-product-form';
import { clearPendingUris } from '@/products/ui/pending-photos-store';
import { useProducts } from '@/products/ui/use-products';

export default function NewProductScreen() {
  const { t } = useTranslation();
  const { forSchedule } = useLocalSearchParams<{ forSchedule?: string }>();
  const { addProduct } = useProducts();

  useEffect(() => {
    clearPendingUris();
    return clearPendingUris;
  }, []);

  const runThenLeave = useRunWithErrorAlert((createdId: string) => {
    if (!forSchedule) {
      router.back();
      return;
    }
    router.dismissTo({
      pathname: '/schedules/new',
      params: { productId: createdId },
    });
  });

  const createProduct = async (input: NewProductInput, photoUris: string[]) => {
    const createdId = await addProduct(input);
    await addPhotos(createdId, photoUris);
    return createdId;
  };

  const addPhotos = async (productId: string, uris: string[]) => {
    try {
      for (const uri of uris) {
        await addImage(productId, uri, DEFAULT_IMAGE_ROLE);
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
        onSubmit={(input, photoUris) =>
          runThenLeave(
            () => createProduct(input, photoUris),
            'products.errorSave',
          )
        }
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
