import { router, Stack, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';

import { ScheduleEditorForm } from '@/ui/components/schedules/editor-form';
import { useProducts } from '@/ui/hooks/use-products';
import { useRunThenCloseEditor } from '@/ui/hooks/use-run-then-close-editor';
import { useSchedules } from '@/ui/hooks/use-schedules';

export default function ScheduleScreen() {
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { products } = useProducts();
  const {
    schedules,
    editSchedule,
    removeSchedule,
    pauseSchedule,
    resumeSchedule,
  } = useSchedules();
  const schedule = schedules.find((s) => s.id === id);

  const runThenGoBack = useRunThenCloseEditor(() => router.back());

  if (!schedule) return null;

  return (
    <>
      <Stack.Screen
        options={{ headerShown: true, title: t('schedule.editTitle') }}
      />
      <ScheduleEditorForm
        schedule={schedule}
        products={products}
        onClose={() => router.back()}
        onSave={(input) =>
          runThenGoBack(
            () => editSchedule(schedule.id, input),
            'schedule.errorSave',
          )
        }
        onDelete={(scheduleId) =>
          runThenGoBack(
            () => removeSchedule(scheduleId),
            'schedule.errorDelete',
          )
        }
        onPause={(scheduleId, resumeAt) =>
          runThenGoBack(
            () => pauseSchedule(scheduleId, resumeAt),
            'schedule.errorPause',
          )
        }
        onResume={(scheduleId) =>
          runThenGoBack(
            () => resumeSchedule(scheduleId),
            'schedule.errorResume',
          )
        }
      />
    </>
  );
}
