import DateTimePicker, {
  type DateTimePickerChangeEvent,
} from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Pressable, StyleSheet } from 'react-native';

import { addTimeOfDay, QUICK_TIMES } from '@/schedules/times-of-day';
import { Radius, Spacing } from '@/ui/commons/constants/theme';
import { toTimeOfDay } from '@/ui/commons/format-date';
import { Chip } from '@/ui/components/commons/chip';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';
import { useFormatTime } from '@/ui/hooks/use-format-date';

type Props = {
  times: string[];
  error?: string;
  onChange: (times: string[]) => void;
};

export function TimeChips({ times, error, onChange }: Props) {
  const { t } = useTranslation();
  const { formatTimeOfDay, is24Hour } = useFormatTime();
  const [pickerOpen, setPickerOpen] = useState(false);

  const onPicked = (_event: DateTimePickerChangeEvent, date: Date) => {
    setPickerOpen(false);
    onChange(addTimeOfDay(times, toTimeOfDay(date)));
  };

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.row}>
        {times.map((time) => (
          <Pressable
            key={time}
            onPress={() => onChange(times.filter((x) => x !== time))}
            accessibilityRole="button"
            accessibilityLabel={t('schedule.removeTime', {
              time: formatTimeOfDay(time),
            })}
            hitSlop={Spacing.four}
          >
            <ThemedView type="accentSoft" style={styles.token}>
              <ThemedText type="mono" themeColor="accent">
                {formatTimeOfDay(time)} ×
              </ThemedText>
            </ThemedView>
          </Pressable>
        ))}
        <Chip
          label={`+ ${t('schedule.addTime')}`}
          selected={false}
          onPress={() => setPickerOpen(true)}
        />
      </ThemedView>
      <ThemedView style={styles.row}>
        {QUICK_TIMES.filter((time) => !times.includes(time)).map((time) => (
          <Chip
            key={time}
            label={formatTimeOfDay(time)}
            selected={false}
            onPress={() => onChange(addTimeOfDay(times, time))}
          />
        ))}
      </ThemedView>
      {error ? (
        <ThemedText type="caption" themeColor="danger">
          {error}
        </ThemedText>
      ) : null}
      {pickerOpen ? (
        <DateTimePicker
          value={new Date()}
          mode="time"
          is24Hour={is24Hour}
          onValueChange={onPicked}
          onDismiss={() => setPickerOpen(false)}
        />
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.eight,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: Spacing.eight,
  },
  token: {
    paddingVertical: Spacing.eight,
    paddingHorizontal: Spacing.fourteen,
    borderRadius: Radius.pill,
  },
});
