import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { ThemedView } from '@/commons/ui/themed-view';
import { useUndoSnackbar } from '@/commons/ui/use-undo-snackbar';
import { useProducts } from '@/products/ui/use-products';
import { scheduleCreateChange } from '@/schedules/schedule-undo';
import { NewScheduleForm } from '@/schedules/ui/new-form';
import { useSchedules } from '@/schedules/ui/use-schedules';

export default function NewScheduleScreen() {
  const { t } = useTranslation();
  const { productId, locked } = useLocalSearchParams<{
    productId?: string;
    locked?: string;
  }>();
  const { products, loaded } = useProducts();
  const { schedules, addSchedule, removeSchedule } = useSchedules();
  const { runWithUndoOnNextScreen } = useUndoSnackbar();

  if (!loaded) return null;

  const lockedProduct = locked
    ? products.find((p) => p.id === productId)
    : undefined;

  return (
    <ThemedView style={styles.container}>
      <Stack.Screen
        options={{ headerShown: true, title: t('schedule.newTitle') }}
      />
      <NewScheduleForm
        products={lockedProduct ? [lockedProduct] : products}
        schedules={schedules}
        selectedProductId={productId}
        productLocked={lockedProduct !== undefined}
        onSubmit={(input) =>
          runWithUndoOnNextScreen(
            scheduleCreateChange(
              input,
              t('schedule.created'),
              addSchedule,
              removeSchedule,
            ),
            'schedule.errorSave',
            () => router.back(),
          )
        }
        onNewProduct={() =>
          router.push({
            pathname: '/products/new',
            params: { forSchedule: '1' },
          })
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
