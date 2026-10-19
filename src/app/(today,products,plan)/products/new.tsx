import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { addImage, DEFAULT_IMAGE_ROLE } from '@/images/image-service';
import type { NewProductInput } from '@/products/dto/new-product-input';
import { NewProductForm } from '@/products/ui/new-product-form';
import { useProducts } from '@/products/ui/use-products';

export default function NewProductScreen() {
  const { t } = useTranslation();
  const { forSchedule } = useLocalSearchParams<{ forSchedule?: string }>();
  const { addProduct } = useProducts();

  const runThenLeave = useRunWithErrorAlert((createdId: string) =>
    forSchedule
      ? router.dismissTo({
          pathname: '/schedules/new',
          params: { productId: createdId },
        })
      : router.back(),
  );

  const createProduct = async (
    input: NewProductInput,
    photoUri: string | null,
  ) => {
    const createdId = await addProduct(input);
    if (photoUri) await addPhoto(createdId, photoUri);
    return createdId;
  };

  const addPhoto = async (productId: string, uri: string) => {
    try {
      await addImage(productId, uri, DEFAULT_IMAGE_ROLE);
    } catch {
      Alert.alert(t('products.errorTitle'), t('images.errorSave'));
    }
  };

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: t('editor.newTitle') }}
      />
      <NewProductForm
        onSubmit={(input, photoUri) =>
          runThenLeave(
            () => createProduct(input, photoUri),
            'products.errorSave',
          )
        }
      />
    </>
  );
}
