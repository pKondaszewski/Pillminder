import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { BottomSheet } from '@/commons/ui/bottom-sheet';
import { Chip } from '@/commons/ui/chip';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedView } from '@/commons/ui/themed-view';
import { currencyLabel } from '@/settings/format-price';
import { type Currency, CURRENCY_OPTIONS } from '@/settings/settings-service';

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
