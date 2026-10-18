import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ProductEditorForm } from '@/ui/components/products/editor-form';
import { useProducts } from '@/ui/hooks/use-products';
import { useRunThenCloseEditor } from '@/ui/hooks/use-run-then-close-editor';

export default function NewProductScreen() {
  const { t } = useTranslation();
  const { forSchedule } = useLocalSearchParams<{ forSchedule?: string }>();
  const { addProduct } = useProducts();

  const runThenLeave = useRunThenCloseEditor((createdId: string) =>
    forSchedule
      ? router.dismissTo({
          pathname: '/schedules/new',
          params: { productId: createdId },
        })
      : router.back(),
  );

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: t('editor.newTitle') }}
      />
      <ProductEditorForm
        product={null}
        onClose={() => router.back()}
        onSave={(input) =>
          runThenLeave(() => addProduct(input), 'products.errorSave')
        }
      />
    </>
  );
}
