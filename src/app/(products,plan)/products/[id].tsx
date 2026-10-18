import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ProductEditorForm } from '@/ui/components/products/editor-form';
import { useProducts } from '@/ui/hooks/use-products';
import { useRunThenCloseEditor } from '@/ui/hooks/use-run-then-close-editor';

export default function ProductScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const {
    products,
    editProduct,
    removeProduct,
    archiveProduct,
    restoreProduct,
  } = useProducts();
  const product = products.find((p) => p.id === id);

  const runThenGoBack = useRunThenCloseEditor(() => router.back());

  if (!product) return null;

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: t('editor.editTitle') }}
      />
      <ProductEditorForm
        product={product}
        onClose={() => router.back()}
        onSave={(input) =>
          runThenGoBack(
            () => editProduct(product.id, input),
            'products.errorSave',
          )
        }
        onDelete={(productId) =>
          runThenGoBack(() => removeProduct(productId), 'products.errorDelete')
        }
        onArchive={(productId, completionNote) =>
          runThenGoBack(
            () => archiveProduct(productId, completionNote),
            'products.errorArchive',
          )
        }
        onRestore={(productId) =>
          runThenGoBack(
            () => restoreProduct(productId),
            'products.errorRestore',
          )
        }
        onAddSchedule={() =>
          router.push({
            pathname: '/schedules/new',
            params: { productId: product.id, locked: '1' },
          })
        }
      />
    </>
  );
}
