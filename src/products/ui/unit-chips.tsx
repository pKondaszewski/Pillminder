import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Chip } from '@/commons/ui/chip';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedView } from '@/commons/ui/themed-view';
import { PRODUCT_UNITS, type ProductUnit } from '@/products/product-service';

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
