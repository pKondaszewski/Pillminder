import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScheduleEditorForm } from '@/ui/components/schedules/editor-form';
import { useProducts } from '@/ui/hooks/use-products';
import { useRunThenCloseEditor } from '@/ui/hooks/use-run-then-close-editor';
import { useSchedules } from '@/ui/hooks/use-schedules';

export default function NewScheduleScreen() {
  const { t } = useTranslation();
  const { productId, locked } = useLocalSearchParams<{
    productId?: string;
    locked?: string;
  }>();
  const { products, loaded } = useProducts();
  const { addSchedule } = useSchedules();

  const runThenGoBack = useRunThenCloseEditor(() => router.back());

  if (!loaded) return null;

  const lockedProduct = locked
    ? products.find((p) => p.id === productId)
    : undefined;

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: t('schedule.newTitle') }}
      />
      <ScheduleEditorForm
        schedule={null}
        products={lockedProduct ? [lockedProduct] : products}
        selectedProductId={productId}
        productLocked={lockedProduct !== undefined}
        onClose={() => router.back()}
        onSave={(input) =>
          runThenGoBack(() => addSchedule(input), 'schedule.errorSave')
        }
        onNewProduct={() =>
          router.push({
            pathname: '/products/new',
            params: { forSchedule: '1' },
          })
        }
      />
    </>
  );
}
