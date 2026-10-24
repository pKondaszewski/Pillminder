import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { SecondaryButton } from '@/commons/ui/button';
import { Spacing } from '@/commons/ui/constants/theme';
import { Stepper } from '@/commons/ui/stepper';
import { SwitchRow } from '@/commons/ui/switch-row';
import { ThemedText } from '@/commons/ui/themed-text';
import { ThemedView } from '@/commons/ui/themed-view';
import type { ProductUnit } from '@/products/product-service';
import type { ScheduleStep } from '@/schedules/schedule-service';
import {
  addStep,
  canAddStep,
  canRemoveStep,
  changeStepDays,
  changeStepQuantity,
  defaultSteps,
  removeStep,
  stopAfterLastStep,
} from '@/schedules/step-edit';
import { QuantityStepper } from '@/schedules/ui/quantity-stepper';

type Props = {
  quantity: number;
  steps: ScheduleStep[] | null;
  unit: ProductUnit | null;
  onChange: (value: { quantity: number; steps: ScheduleStep[] | null }) => void;
};

export function QuantityPicker({ quantity, steps, unit, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.container}>
      {steps ? null : (
        <QuantityStepper
          quantity={quantity}
          unit={unit}
          onChange={(next) => onChange({ quantity: next, steps })}
        />
      )}
      <SwitchRow
        label={t('schedule.steps')}
        value={steps !== null}
        onValueChange={(on) =>
          onChange({ quantity, steps: on ? defaultSteps(quantity) : null })
        }
      />
      {steps ? (
        <StepList
          steps={steps}
          unit={unit}
          onChange={(next) => onChange({ quantity, steps: next })}
        />
      ) : null}
    </ThemedView>
  );
}

function StepList({
  steps,
  unit,
  onChange,
}: {
  steps: ScheduleStep[];
  unit: ProductUnit | null;
  onChange: (steps: ScheduleStep[]) => void;
}) {
  const { t } = useTranslation();
  const last = steps[steps.length - 1];

  return (
    <>
      {steps.map((step, index) => (
        <ThemedView key={index} style={styles.step}>
          <ThemedText type="small" themeColor="textSecondary">
            {t('schedule.stepNumber', { number: index + 1 })}
          </ThemedText>
          <QuantityStepper
            quantity={step.quantity}
            unit={unit}
            onChange={(quantity) =>
              onChange(changeStepQuantity(steps, index, quantity))
            }
          />
          {step.days === null ? (
            <ThemedText type="small" themeColor="textSecondary">
              {t('schedule.stepStays')}
            </ThemedText>
          ) : (
            <Stepper
              decrementLabel={t('schedule.stepShorter')}
              incrementLabel={t('schedule.stepLonger')}
              onDecrement={() => onChange(changeStepDays(steps, index, -1))}
              onIncrement={() => onChange(changeStepDays(steps, index, 1))}
            >
              <ThemedText style={styles.value}>
                {t('schedule.stepDays', { count: step.days })}
              </ThemedText>
            </Stepper>
          )}
          {canRemoveStep(steps) ? (
            <SecondaryButton
              label={t('schedule.stepRemove', { number: index + 1 })}
              onPress={() => onChange(removeStep(steps, index))}
              fitContent
            />
          ) : null}
        </ThemedView>
      ))}
      <SwitchRow
        label={t('schedule.stepsStop')}
        value={last.days !== null}
        onValueChange={(stop) => onChange(stopAfterLastStep(steps, stop))}
      />
      {canAddStep(steps) ? (
        <SecondaryButton
          label={t('schedule.stepAdd')}
          onPress={() => onChange(addStep(steps))}
          fitContent
        />
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: Spacing.twelve,
  },
  step: {
    gap: Spacing.eight,
  },
  value: {
    minWidth: 110,
    textAlign: 'center',
  },
});
