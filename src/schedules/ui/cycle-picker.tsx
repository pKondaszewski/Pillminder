import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Spacing } from '@/commons/ui/constants/theme';
import { SegmentedControl } from '@/commons/ui/segmented-control';
import { Stepper } from '@/commons/ui/stepper';
import { SwitchRow } from '@/commons/ui/switch-row';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import { DAYS_IN_WEEK } from '@/config/calendar-grid';
import {
  type CycleUnit,
  cycleUnitKey,
  daysPerUnit,
  MAX_CYCLE_DAYS,
  type ScheduleCycle,
} from '@/schedules/schedule-service';

type Props = {
  cycle: ScheduleCycle | null;
  onChange: (cycle: ScheduleCycle | null) => void;
};

const DEFAULT_CYCLE: ScheduleCycle = { onDays: 21, offDays: 7, unit: 'days' };

export function CyclePicker({ cycle, onChange }: Props) {
  const { t } = useTranslation();
  const unitOptions = [
    { value: 'days', label: t('schedule.cycleUnitDays') },
    { value: 'weeks', label: t('schedule.cycleUnitWeeks') },
  ] as const;

  return (
    <ThemedView style={styles.container}>
      <SwitchRow
        label={t('schedule.cycle')}
        value={cycle !== null}
        onValueChange={(on) => onChange(on ? DEFAULT_CYCLE : null)}
      />
      {cycle ? (
        <>
          <SegmentedControl
            options={unitOptions}
            selected={cycle.unit}
            onSelect={(unit) => onChange(withUnit(cycle, unit))}
          />
          <LengthStepper
            label={t('schedule.cycleOn')}
            cycle={cycle}
            field="onDays"
            onChange={onChange}
          />
          <LengthStepper
            label={t('schedule.cycleOff')}
            cycle={cycle}
            field="offDays"
            onChange={onChange}
          />
        </>
      ) : null}
    </ThemedView>
  );
}

function LengthStepper({
  label,
  cycle,
  field,
  onChange,
}: {
  label: string;
  cycle: ScheduleCycle;
  field: 'onDays' | 'offDays';
  onChange: (cycle: ScheduleCycle) => void;
}) {
  const { t } = useTranslation();
  const perUnit = daysPerUnit(cycle.unit);
  const units = cycle[field] / perUnit;
  const change = (delta: number) => {
    const next = Math.min(
      Math.floor(MAX_CYCLE_DAYS / perUnit),
      Math.max(1, units + delta),
    );
    onChange({ ...cycle, [field]: next * perUnit });
  };

  return (
    <ThemedView style={styles.length}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <Stepper
        decrementLabel={t('schedule.cycleShorter')}
        incrementLabel={t('schedule.cycleLonger')}
        onDecrement={() => change(-1)}
        onIncrement={() => change(1)}
      >
        <ThemedText style={styles.value}>
          {t(cycleUnitKey(cycle.unit), { count: units })}
        </ThemedText>
      </Stepper>
    </ThemedView>
  );
}

// Lengths are stored in days. Switching to weeks rounds to whole weeks.
function withUnit(cycle: ScheduleCycle, unit: CycleUnit): ScheduleCycle {
  if (unit === cycle.unit) return cycle;
  if (unit === 'days') return { ...cycle, unit };
  const toWeeks = (days: number) =>
    Math.max(1, Math.round(days / DAYS_IN_WEEK)) * DAYS_IN_WEEK;
  return {
    onDays: toWeeks(cycle.onDays),
    offDays: toWeeks(cycle.offDays),
    unit,
  };
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.twelve,
  },
  length: {
    gap: Spacing.four,
  },
  value: {
    minWidth: 110,
    textAlign: 'center',
  },
});
