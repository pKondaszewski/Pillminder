import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { type Currency, CURRENCY_OPTIONS } from '@/settings/settings-store';
import { Spacing } from '@/ui/commons/constants/theme';
import { currencyLabel } from '@/ui/commons/format-price';
import { BottomSheet } from '@/ui/components/commons/bottom-sheet';
import { Chip } from '@/ui/components/commons/chip';
import { ThemedView } from '@/ui/components/commons/themed-view';

type Props = {
  currency: Currency;
  locale: string;
  onSave: (currency: Currency) => void;
  onClose: () => void;
};

export function CurrencySheet({ currency, locale, onSave, onClose }: Props) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState(currency);

  return (
    <BottomSheet
      visible
      title={t('settings.currency')}
      onClose={onClose}
      onSave={() => onSave(selected)}
    >
      <ThemedView style={styles.chips}>
        {CURRENCY_OPTIONS.map((option) => (
          <Chip
            key={option}
            label={currencyLabel(option, locale)}
            selected={option === selected}
            onPress={() => setSelected(option)}
          />
        ))}
      </ThemedView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.eight,
  },
});
