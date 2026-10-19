import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { PRODUCT_UNITS, type ProductUnit } from '@/products/product-service';
import { Spacing } from '@/ui/commons/constants/theme';
import { Chip } from '@/ui/components/commons/chip';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  selected: ProductUnit | null;
  onSelect: (unit: ProductUnit | null) => void;
};

export function UnitChips({ selected, onSelect }: Props) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.chips}>
      {[null, ...PRODUCT_UNITS].map((unit) => (
        <Chip
          key={unit ?? 'none'}
          label={unit ? t(`unitName.${unit}`) : t('editor.unitNone')}
          selected={unit === selected}
          onPress={() => onSelect(unit)}
        />
      ))}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
