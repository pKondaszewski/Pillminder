import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Stepper } from '@/commons/ui/stepper';
import { ThemedText } from '@/commons/ui/themed-text';
import type { ProductUnit } from '@/products/product-service';
import { formatAmount } from '@/products/product-unit';

type Props = {
  quantity: number;
  unit: ProductUnit | null;
  onChange: (quantity: number) => void;
};

export function QuantityStepper({ quantity, unit, onChange }: Props) {
  const { t } = useTranslation();

  return (
    <Stepper
      decrementLabel={t('schedule.quantityLess')}
      incrementLabel={t('schedule.quantityMore')}
      onDecrement={() => onChange(Math.max(1, quantity - 1))}
      onIncrement={() => onChange(quantity + 1)}
    >
      <ThemedText style={styles.value}>
        {unit ? formatAmount(quantity, unit, t) : quantity}
      </ThemedText>
    </Stepper>
  );
}

const styles = StyleSheet.create({
  value: {
    minWidth: 110,
    textAlign: 'center',
  },
});
