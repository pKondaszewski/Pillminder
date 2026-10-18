import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { NewScheduleForm } from '@/ui/components/schedules/new-form';
import { useProducts } from '@/ui/hooks/use-products';
import { useRunWithErrorAlert } from '@/ui/hooks/use-run-with-error-alert';
import { useSchedules } from '@/ui/hooks/use-schedules';

export default function NewScheduleScreen() {
  const { t } = useTranslation();
  const { productId, locked } = useLocalSearchParams<{
    productId?: string;
    locked?: string;
  }>();
  const { products, loaded } = useProducts();
  const { schedules, addSchedule } = useSchedules();

  const runThenGoBack = useRunWithErrorAlert(() => router.back());

  if (!loaded) return null;

  const lockedProduct = locked
    ? products.find((p) => p.id === productId)
    : undefined;

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: t('schedule.newTitle') }}
      />
      <NewScheduleForm
        products={lockedProduct ? [lockedProduct] : products}
        schedules={schedules}
        selectedProductId={productId}
        productLocked={lockedProduct !== undefined}
        onSubmit={(input) =>
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
