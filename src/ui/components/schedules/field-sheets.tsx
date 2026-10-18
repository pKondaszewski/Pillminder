import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { addDays, startOfDay } from '@/config/date-utils';
import type { ProductUnit } from '@/products/product-unit';
import type { ScheduleChange } from '@/schedules/dto/new-schedule-input';
import { scheduleDraftErrors } from '@/schedules/schedule-draft';
import type { Schedule } from '@/schedules/schedule-service';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import { Chip } from '@/ui/components/commons/chip';
import { FieldRow } from '@/ui/components/commons/field-row';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { PeriodFields } from '@/ui/components/schedules/period-fields';
import { QuantityStepper } from '@/ui/components/schedules/quantity-stepper';
import { RhythmPicker } from '@/ui/components/schedules/rhythm-picker';
import { TimeChips } from '@/ui/components/schedules/time-chips';
import { useFormatDate } from '@/ui/hooks/use-format-date';

export type ScheduleField =
  | 'rhythm'
  | 'times'
  | 'quantity'
  | 'period'
  | 'pause';

type Props = {
  field: ScheduleField;
  schedule: Schedule;
  unit: ProductUnit | null;
  now: Date;
  onSave: (change: ScheduleChange) => void;
  onPause: (resumeAt: Date | null) => void;
  onClose: () => void;
};

type SheetProps = {
  schedule: Schedule;
  unit: ProductUnit | null;
  now: Date;
  onSave: (change: ScheduleChange) => void;
  onClose: () => void;
};

export function ScheduleFieldSheet({ field, onPause, ...props }: Props) {
  switch (field) {
    case 'rhythm':
      return <RhythmSheet {...props} />;
    case 'times':
      return <TimesSheet {...props} />;
    case 'quantity':
      return <QuantitySheet {...props} />;
    case 'period':
      return <PeriodSheet {...props} />;
    case 'pause':
      return (
        <PauseSheet now={props.now} onClose={props.onClose} onPause={onPause} />
      );
  }
}

function RhythmSheet({ schedule, onSave, onClose }: SheetProps) {
  const { t } = useTranslation();
  const [intervalDays, setIntervalDays] = useState(schedule.intervalDays);

  return (
    <BottomSheet
      visible
      title={t('schedule.intervalDays')}
      onClose={onClose}
      onSave={() => onSave({ intervalDays })}
    >
      <RhythmPicker intervalDays={intervalDays} onChange={setIntervalDays} />
      <ChangeNote />
    </BottomSheet>
  );
}

function TimesSheet({ schedule, onSave, onClose }: SheetProps) {
  const { t } = useTranslation();
  const [timesOfDay, setTimesOfDay] = useState(schedule.timesOfDay);
  const [submitted, setSubmitted] = useState(false);
  const error = scheduleDraftErrors({ ...schedule, timesOfDay }).times;

  return (
    <BottomSheet
      visible
      title={t('schedule.timesOfDay')}
      onClose={onClose}
      onSave={() => (error ? setSubmitted(true) : onSave({ timesOfDay }))}
    >
      <TimeChips
        times={timesOfDay}
        error={submitted && error ? t(error) : undefined}
        onChange={setTimesOfDay}
      />
      <ChangeNote />
    </BottomSheet>
  );
}

function QuantitySheet({ schedule, unit, onSave, onClose }: SheetProps) {
  const { t } = useTranslation();
  const [quantity, setQuantity] = useState(schedule.quantity);

  return (
    <BottomSheet
      visible
      title={t('schedule.quantity')}
      onClose={onClose}
      onSave={() => onSave({ quantity })}
    >
      <QuantityStepper quantity={quantity} unit={unit} onChange={setQuantity} />
      <ChangeNote />
    </BottomSheet>
  );
}

function PeriodSheet({ schedule, now, onSave, onClose }: SheetProps) {
  const { t } = useTranslation();
  const [period, setPeriod] = useState({
    startDate: schedule.startDate,
    endDate: schedule.endDate,
  });
  const [submitted, setSubmitted] = useState(false);
  const error = scheduleDraftErrors({ ...schedule, ...period }).period;

  return (
    <BottomSheet
      visible
      title={t('schedule.periodLabel')}
      onClose={onClose}
      onSave={() => (error ? setSubmitted(true) : onSave(period))}
    >
      <PeriodFields
        {...period}
        now={now}
        error={submitted && error ? t(error) : undefined}
        onChange={setPeriod}
      />
      <ChangeNote />
    </BottomSheet>
  );
}

function PauseSheet({
  now,
  onClose,
  onPause,
}: {
  now: Date;
  onClose: () => void;
  onPause: (resumeAt: Date | null) => void;
}) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const [resumeAt, setResumeAt] = useState<Date | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const tomorrow = addDays(startOfDay(now), 1);

  const onPicked = (_event: DateTimePickerChangeEvent, date: Date) => {
    setPickerOpen(false);
    setResumeAt(startOfDay(date));
  };

  return (
    <BottomSheet
      visible
      title={t('schedule.pauseAction')}
      onClose={onClose}
      onSave={() => onPause(resumeAt)}
    >
      <Chip
        label={t('schedule.resumeManually')}
        selected={resumeAt === null}
        onPress={() => setResumeAt(null)}
      />
      <FieldRow
        label={t('schedule.resumeDate')}
        value={resumeAt ? formatDate(resumeAt) : t('schedule.periodNone')}
        onPress={() => setPickerOpen(true)}
      />
      {pickerOpen ? (
        <DateTimePicker
          value={resumeAt ?? tomorrow}
          minimumDate={tomorrow}
          mode="date"
          onValueChange={onPicked}
          onDismiss={() => setPickerOpen(false)}
        />
      ) : null}
    </BottomSheet>
  );
}

function ChangeNote() {
  const { t } = useTranslation();

  return <ThemedText type="caption">{t('schedule.changeNote')}</ThemedText>;
}
