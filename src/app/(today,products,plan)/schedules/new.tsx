import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { useRunWithErrorAlert } from '@/commons/ui/use-run-with-error-alert';
import { useProducts } from '@/products/ui/use-products';
import { NewScheduleForm } from '@/schedules/ui/new-form';
import { useSchedules } from '@/schedules/ui/use-schedules';
import { TutorialBanner } from '@/tutorial/ui/tutorial-banner';
import { useTutorial } from '@/tutorial/ui/use-tutorial';

export default function NewScheduleScreen() {
  const { t } = useTranslation();
  const { productId, locked } = useLocalSearchParams<{
    productId?: string;
    locked?: string;
  }>();
  const { products, loaded } = useProducts();
  const { schedules, addSchedule } = useSchedules();

  const tutorial = useTutorial();

  const runThenGoBack = useRunWithErrorAlert(() => {
    if (tutorial.step === 'schedule') tutorial.advance();
    router.back();
  });

  if (!loaded) return null;

  const lockedProduct = locked
    ? products.find((p) => p.id === productId)
    : undefined;

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: t('schedule.newTitle') }}
      />
      <TutorialBanner step="schedule" />
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
