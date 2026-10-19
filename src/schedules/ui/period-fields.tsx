import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Chip } from '@/commons/ui/chip';
import { Spacing } from '@/commons/ui/constants/theme';
import { FieldRow } from '@/commons/ui/field-row';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { useFormatDate } from '@/commons/ui/use-format-date';
import { startOfDay } from '@/config/date-utils';
import { COURSE_PRESET_DAYS, courseEndDate } from '@/schedules/schedule-period';

export type Period = {
  startDate: Date | null;
  endDate: Date | null;
};

type Props = Period & {
  now: Date;
  error?: string;
  onChange: (period: Period) => void;
};

export function PeriodFields({
  startDate,
  endDate,
  now,
  error,
  onChange,
}: Props) {
  const { t } = useTranslation();
  const formatDate = useFormatDate();
  const [pickerFor, setPickerFor] = useState<keyof Period | null>(null);

  const onPicked = (_event: DateTimePickerChangeEvent, date: Date) => {
    if (pickerFor === 'startDate') {
      onChange({ startDate: startOfDay(date), endDate });
    }
    if (pickerFor === 'endDate') {
      onChange({ startDate, endDate: startOfDay(date) });
    }
    setPickerFor(null);
  };

  return (
    <ThemedView style={styles.container}>
      <FieldRow
        label={t('schedule.periodStart')}
        value={startDate ? formatDate(startDate) : t('schedule.startNone')}
        onPress={() => setPickerFor('startDate')}
      />
      <FieldRow
        label={t('schedule.periodEnd')}
        value={endDate ? formatDate(endDate) : t('schedule.endNone')}
        onPress={() => setPickerFor('endDate')}
      />
      <ThemedView style={styles.presets}>
        <Chip
          label={t('schedule.endNone')}
          selected={endDate === null}
          onPress={() => onChange({ startDate, endDate: null })}
        />
        {COURSE_PRESET_DAYS.map((days) => (
          <Chip
            key={days}
            label={t('schedule.presetDays', { days })}
            selected={
              endDate?.getTime() ===
              courseEndDate(startDate, days, now).getTime()
            }
            onPress={() =>
              onChange({
                startDate,
                endDate: courseEndDate(startDate, days, now),
              })
            }
          />
        ))}
      </ThemedView>
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
      {pickerFor ? (
        <DateTimePicker
          value={(pickerFor === 'startDate' ? startDate : endDate) ?? now}
          mode="date"
          onValueChange={onPicked}
          onDismiss={() => setPickerFor(null)}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.eight,
  },
  presets: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
