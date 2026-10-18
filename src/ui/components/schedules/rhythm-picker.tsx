import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/ui/commons/constants/theme';
import { SegmentedControl } from '@/ui/components/commons/segmented-control';
import { Stepper } from '@/ui/components/commons/stepper';
import { ThemedText } from '@/ui/components/commons/themed-text';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  intervalDays: number;
  onChange: (intervalDays: number) => void;
};

const MIN_INTERVAL_DAYS = 2;

export function RhythmPicker({ intervalDays, onChange }: Props) {
  const { t } = useTranslation();
  const options = [
    { value: 'daily', label: t('schedule.daily') },
    { value: 'interval', label: t('schedule.everyFewDays') },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <SegmentedControl
        options={options}
        selected={intervalDays === 1 ? 'daily' : 'interval'}
        onSelect={(value) =>
          onChange(
            value === 'daily' ? 1 : Math.max(intervalDays, MIN_INTERVAL_DAYS),
          )
        }
      />
      {intervalDays > 1 ? (
        <Stepper
          decrementLabel={t('schedule.intervalLess')}
          incrementLabel={t('schedule.intervalMore')}
          onDecrement={() =>
            onChange(Math.max(MIN_INTERVAL_DAYS, intervalDays - 1))
          }
          onIncrement={() => onChange(intervalDays + 1)}
        >
          <ThemedText style={styles.value}>
            {t('schedule.everyXDays', { days: intervalDays })}
          </ThemedText>
        </Stepper>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.twelve,
  },
  value: {
    minWidth: 110,
    textAlign: 'center',
  },
});
