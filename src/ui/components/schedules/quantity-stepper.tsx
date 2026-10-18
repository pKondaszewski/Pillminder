import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { formatAmount, type ProductUnit } from '@/products/product-unit';
import { Stepper } from '@/ui/components/commons/stepper';
import { ThemedText } from '@/ui/components/commons/themed-text';

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
