import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';

import { Chip } from '@/commons/ui/chip';
import { Spacing } from '@/commons/ui/constants/theme';
import { ThemedView } from '@/commons/ui/themed-view';
import { storeSuggestionKeys } from '@/products/category';

type Props = {
  category: string;
  onPick: (storeLink: string) => void;
};

export function StoreSuggestions({ category, onPick }: Props) {
  const { t } = useTranslation();

  return (
    <ThemedView style={styles.chips}>
      {storeSuggestionKeys(category).map((key) => (
        <Chip
          key={key}
          label={t(`storeSuggestion.${key}`)}
          selected={false}
          onPress={() => onPick(t(`storeSuggestion.${key}`))}
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
