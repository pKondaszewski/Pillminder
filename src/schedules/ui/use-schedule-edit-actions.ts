import { useTranslation } from 'react-i18next';

import type { RunWithUndo } from '@/commons/ui/use-undo-snackbar';
import type { ScheduleChange } from '@/schedules/dto/new-schedule-input';
import type { Schedule } from '@/schedules/schedule-service';
import { scheduleEditChange } from '@/schedules/schedule-undo';
import {
  SCHEDULE_FIELD_LABEL_KEYS,
  type ScheduleField,
} from '@/schedules/ui/field-sheets';

import { useSchedules } from './use-schedules';

export function useScheduleEditActions(runWithUndo: RunWithUndo) {
  const { t } = useTranslation();
  const { editSchedule, restoreSchedule, pauseSchedule, resumeSchedule } =
    useSchedules();

  const saveChange = (
    schedule: Schedule,
    field: ScheduleField,
    change: ScheduleChange,
    onSuccess: () => void,
  ) =>
    runWithUndo(
      scheduleEditChange(
        schedule,
        change,
        t('editor.saved', { field: t(SCHEDULE_FIELD_LABEL_KEYS[field]) }),
        { save: editSchedule, restore: restoreSchedule },
      ),
      'schedule.errorSave',
      onSuccess,
    );

  const pause = (
    schedule: Schedule,
    resumeAt: Date | null,
    onSuccess: () => void,
  ) =>
    runWithUndo(
      {
        message: t('schedule.pausedToast'),
        apply: () => pauseSchedule(schedule.id, resumeAt),
        revert: () => resumeSchedule(schedule.id),
      },
      'schedule.errorPause',
      onSuccess,
    );

  const resume = (schedule: Schedule) =>
    runWithUndo(
      {
        message: t('schedule.resumedToast'),
        apply: () => resumeSchedule(schedule.id),
        revert: () => pauseSchedule(schedule.id, schedule.resumeAt),
      },
      'schedule.errorResume',
    );

  return { saveChange, pause, resume };
}
